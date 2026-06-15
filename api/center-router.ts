import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  centers, users, lessons, inviteCodes,
  centerRequestEmails, centerRequestLocations,
  centerRequestPhones, centerRequestAlbums,
} from "@db/schema";
import { eq, and, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.adminId, ctx.user.id));
    if (!center) return [];
    return db
      .select()
      .from(users)
      .where(eq(users.centerId, center.id));
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
    };
  }),

  // saveSettings removed — use `update` instead
});
