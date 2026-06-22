import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  centers, users, lessons, inviteCodes, questions, quizAttempts, uploads,
  centerRequestEmails, centerRequestLocations,
  centerRequestPhones, centerRequestAlbums,
} from "@db/schema";
import { eq, and, count, inArray, gte, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createNotification } from "./lib/notifications";

export const centerRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(centers);
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.slug, input.slug));
      return center ?? null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.id, input.id));
      return center ?? null;
    }),

  myCenter: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return null;
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.id, ctx.user.centerId));
    return center ?? null;
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        logo: z.string().optional().nullable(),
        banner: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        phone: z.string().max(50).optional().nullable(),
        slug: z.string().min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(centers)
        .where(eq(centers.slug, input.slug));
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "A center with this slug already exists" });
      }
      await db.insert(centers).values({
        name: input.name,
        description: input.description ?? "",
        logo: input.logo,
        banner: input.banner,
        address: input.address,
        phone: input.phone,
        adminId: ctx.user.id,
        slug: input.slug,
      });
      const [newCenter] = await db
        .select()
        .from(centers)
        .where(eq(centers.slug, input.slug));
      if (!newCenter) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create center" });
      await db
        .update(users)
        .set({
          role: "teacher",
          centerId: newCenter.id,
        })
        .where(eq(users.id, ctx.user.id));
      return newCenter;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional().nullable(),
        logo: z.string().optional().nullable(),
        banner: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        phone: z.string().max(50).optional().nullable(),
        emails: z.array(z.object({ email: z.string().email() })).optional().nullable(),
        locations: z.array(z.object({ country: z.string(), city: z.string(), address: z.string() })).optional().nullable(),
        phones: z.array(z.object({ countryCode: z.string(), number: z.string() })).optional().nullable(),
        albumImages: z.array(z.string()).optional().nullable(),
        themeColor: z.string().max(7).optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.id, input.id));
      if (!center || center.adminId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this center" });
      }
      await db
        .update(centers)
        .set({
          name: input.name ?? center.name,
          description: input.description !== undefined ? input.description : center.description,
          logo: input.logo !== undefined ? input.logo : center.logo,
          banner: input.banner !== undefined ? input.banner : center.banner,
          address: input.address !== undefined ? input.address : center.address,
          phone: input.phone !== undefined ? input.phone : center.phone,
          ...(input.emails !== undefined && { emails: input.emails }),
          ...(input.locations !== undefined && { locations: input.locations }),
          ...(input.phones !== undefined && { phones: input.phones }),
          ...(input.albumImages !== undefined && { albumImages: input.albumImages }),
          ...(input.themeColor !== undefined && { themeColor: input.themeColor }),
        })
        .where(eq(centers.id, input.id));
      return { success: true };
    }),

  dashboardStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return null;
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.id, ctx.user.centerId));
    if (!center) return null;

    const [lessonsCount] = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.centerId, center.id));

    const [studentsCount] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(eq(users.centerId, center.id), eq(users.role, "student"))
      );

    const [codesCount] = await db
      .select({ count: count() })
      .from(inviteCodes)
      .where(eq(inviteCodes.centerId, center.id));

    const recentLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.centerId, center.id))
      .limit(5);

    return {
      center,
      lessonsCount: lessonsCount.count,
      studentsCount: studentsCount.count,
      inviteCodesCount: codesCount.count,
      recentLessons,
    };
  }),

  myStudents: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return [];
    return db
      .select()
      .from(users)
      .where(eq(users.centerId, ctx.user.centerId));
  }),

  kickStudent: authedQuery
    .input(z.object({ studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      const [student] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.studentId));
      if (!student || student.centerId !== ctx.user.centerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found in your center" });
      }

      await db.update(users).set({ centerId: null }).where(eq(users.id, input.studentId));

      await db.update(inviteCodes).set({ usedBy: null, usedAt: null }).where(eq(inviteCodes.usedBy, input.studentId));

      return { success: true };
    }),

  updateStudentLevel: authedQuery
    .input(z.object({ studentId: z.number(), level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).nullable() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      const [student] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.studentId));
      if (!student || student.centerId !== ctx.user.centerId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Student not found in your center" });
      }

      await db.update(users).set({ level: input.level }).where(eq(users.id, input.studentId));

      return { success: true };
    }),

  remindLevel: authedQuery
    .mutation(async ({ ctx }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });
      if (ctx.user.level) throw new TRPCError({ code: "BAD_REQUEST", message: "You already have a level assigned" });

      const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id));

      const twoHours = 2 * 60 * 60 * 1000;
      if (user.levelRequestedAt && Date.now() - new Date(user.levelRequestedAt).getTime() < twoHours) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You can only remind your teacher once every 2 hours" });
      }

      await db.update(users).set({ levelRequestedAt: new Date() }).where(eq(users.id, ctx.user.id));

      const centerAdmins = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.centerId, ctx.user.centerId), eq(users.role, "teacher")));

      await Promise.all(centerAdmins.map((admin) =>
        createNotification(admin.id, "level_reminder", "Level Reminder", `${ctx.user.name ?? "A student"} is waiting for a level assignment.`, "/admin")
      ));

      return { success: true };
    }),

  settings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return null;
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.id, ctx.user.centerId));
    if (!center) return null;

    let emails = center.emails ?? null;
    let locations = center.locations ?? null;
    let phones = center.phones ?? null;
    let albumImages = center.albumImages ?? null;

    if (!emails && center.requestId) {
      const rows = await db
        .select()
        .from(centerRequestEmails)
        .where(eq(centerRequestEmails.requestId, center.requestId));
      emails = rows.map((r) => ({ email: r.email }));
    }
    if (!locations && center.requestId) {
      const rows = await db
        .select()
        .from(centerRequestLocations)
        .where(eq(centerRequestLocations.requestId, center.requestId));
      locations = rows.map((r) => ({ country: r.country, city: r.city, address: r.address }));
    }
    if (!phones && center.requestId) {
      const rows = await db
        .select()
        .from(centerRequestPhones)
        .where(eq(centerRequestPhones.requestId, center.requestId));
      phones = rows.map((r) => ({ countryCode: r.countryCode, number: r.number }));
    }
    if (!albumImages && center.requestId) {
      const rows = await db
        .select()
        .from(centerRequestAlbums)
        .where(eq(centerRequestAlbums.requestId, center.requestId));
      albumImages = rows.map((r) => r.imageUrl);
    }

    const [studentCount] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.centerId, center.id), eq(users.role, "student")));

    const [lessonCount] = await db
      .select({ count: count() })
      .from(lessons)
      .where(eq(lessons.centerId, center.id));

    // Get active students (logged in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [activeStudentCount] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.centerId, center.id),
          eq(users.role, "student"),
          gte(users.lastSignInAt, thirtyDaysAgo)
        )
      );

    // Get quiz count
    const [quizCount] = await db
      .select({ count: count() })
      .from(questions)
      .where(inArray(questions.lessonId, 
        db.select({ id: lessons.id }).from(lessons).where(eq(lessons.centerId, center.id))
      ));

    // Real storage usage from uploads table
    const [storageResult] = await db
      .select({ totalBytes: sql<number>`COALESCE(SUM(fileSize), 0)` })
      .from(uploads)
      .where(eq(uploads.centerId, center.id));
    const storageUsedMB = Math.round((storageResult.totalBytes / (1024 * 1024)) * 100) / 100;

    return {
      id: center.id,
      name: center.name,
      description: center.description,
      logo: center.logo,
      banner: center.banner,
      address: center.address,
      phone: center.phone,
      slug: center.slug,
      emails,
      locations,
      phones,
      albumImages,
      themeColor: center.themeColor,
      plan: center.plan,
      videoUploadCount: center.videoUploadCount,
      videoUploadWeek: center.videoUploadWeek,
      assignmentCount: center.assignmentCount,
      assignmentCountWeek: center.assignmentCountWeek,
      studentCount: studentCount.count,
      lessonCount: lessonCount.count,
      // New usage analytics
      usage: {
        studentCount: studentCount.count,
        activeStudents: activeStudentCount.count,
        videoUploadCount: center.videoUploadCount,
        videoUploadWeek: center.videoUploadWeek,
        assignmentCount: center.assignmentCount,
        assignmentCountWeek: center.assignmentCountWeek,
        lessonsCreated: lessonCount.count,
        quizzesCreated: quizCount.count,
        storageUsedMB: storageUsedMB,
      },
      limits: {
        maxStudents: center.plan === "premium" ? 999999 : 10,
        maxVideosPerWeek: center.plan === "premium" ? 999999 : 1,
        maxInviteCodes: center.plan === "premium" ? 999999 : 1,
        maxStorageGB: center.plan === "premium" ? 100 : 5,
      },
      // Billing info
      nextBillingDate: center.nextBillingDate,
      planStartDate: center.planStartDate,
    };
  }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.id, input.id));
      if (!center || center.adminId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this center" });
      }

      const lessonIds = (await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.centerId, input.id)))
        .map((r) => r.id);

      if (lessonIds.length > 0) {
        await db.delete(quizAttempts).where(inArray(quizAttempts.lessonId, lessonIds));
        await db.delete(questions).where(inArray(questions.lessonId, lessonIds));
      }
      await db.delete(lessons).where(eq(lessons.centerId, input.id));
      await db.delete(inviteCodes).where(eq(inviteCodes.centerId, input.id));
      await db
        .update(users)
        .set({ centerId: null })
        .where(eq(users.centerId, input.id));
      await db.delete(centers).where(eq(centers.id, input.id));

      return { success: true };
    }),

  // saveSettings removed — use `update` instead
});
