import { z } from "zod";
import { createRouter, publicQuery, authedQuery, superAdminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  centerRequests, centerRequestEmails, centerRequestLocations,
  centerRequestPhones, centerRequestAlbums, centerRequestDocuments,
  users, centers,
} from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const emailEntry = z.object({ email: z.string().email() });
const locationEntry = z.object({
  country: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
});
const phoneEntry = z.object({
  countryCode: z.string().min(1),
  number: z.string().min(1).max(50),
});

export const centerRequestRouter = createRouter({
  submit: authedQuery
    .input(
      z.object({
        centerName: z.string().min(1).max(255),
        centerBio: z.string().optional(),
        logo: z.string().optional().nullable(),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
        emails: z.array(emailEntry).min(1),
        locations: z.array(locationEntry).min(1),
        phones: z.array(phoneEntry).min(1),
        albumImages: z.array(z.string()).optional(),
        documents: z.array(z.object({ url: z.string(), type: z.string().optional() })).optional(),
        acceptedTerms: z.boolean().refine((v) => v === true, { message: "Must accept terms" }),
        acceptedPrivacy: z.boolean().refine((v) => v === true, { message: "Must accept privacy" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (ctx.user.role === "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admins cannot create center requests" });
      }

      const [existing] = await db
        .select()
        .from(centerRequests)
        .where(
          and(
            eq(centerRequests.teacherId, ctx.user.id),
            eq(centerRequests.status, "pending")
          )
        );
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You already have a pending request" });
      }

      const [existingSlug] = await db
        .select()
        .from(centerRequests)
        .where(eq(centerRequests.slug, input.slug));
      if (existingSlug) {
        throw new TRPCError({ code: "CONFLICT", message: "This URL slug is already taken" });
      }

      const [req] = await db.insert(centerRequests).values({
        teacherId: ctx.user.id,
        centerName: input.centerName,
        centerBio: input.centerBio ?? "",
        logo: input.logo,
        slug: input.slug,
      });

      const requestId = Number(req.insertId);

      if (input.emails.length > 0) {
        await db.insert(centerRequestEmails).values(
          input.emails.map((e) => ({ requestId, email: e.email }))
        );
      }

      if (input.locations.length > 0) {
        await db.insert(centerRequestLocations).values(
          input.locations.map((l) => ({ requestId, ...l }))
        );
      }

      if (input.phones.length > 0) {
        await db.insert(centerRequestPhones).values(
          input.phones.map((p) => ({ requestId, ...p }))
        );
      }

      if (input.albumImages && input.albumImages.length > 0) {
        await db.insert(centerRequestAlbums).values(
          input.albumImages.map((url) => ({ requestId, imageUrl: url }))
        );
      }

      if (input.documents && input.documents.length > 0) {
        await db.insert(centerRequestDocuments).values(
          input.documents.map((d) => ({ requestId, documentUrl: d.url, documentType: d.type ?? null }))
        );
      }

      return { success: true, requestId, slug: input.slug };
    }),

  myRequest: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [req] = await db
      .select()
      .from(centerRequests)
      .where(eq(centerRequests.teacherId, ctx.user.id))
      .orderBy(desc(centerRequests.createdAt))
      .limit(1);
    if (!req) return null;

    const [emails, locations, phones, albums, documents] = await Promise.all([
      db.select().from(centerRequestEmails).where(eq(centerRequestEmails.requestId, req.id)),
      db.select().from(centerRequestLocations).where(eq(centerRequestLocations.requestId, req.id)),
      db.select().from(centerRequestPhones).where(eq(centerRequestPhones.requestId, req.id)),
      db.select().from(centerRequestAlbums).where(eq(centerRequestAlbums.requestId, req.id)),
      db.select().from(centerRequestDocuments).where(eq(centerRequestDocuments.requestId, req.id)),
    ]);

    return { ...req, emails, locations, phones, albums, documents };
  }),

  listPending: superAdminQuery.query(async () => {
    const db = getDb();
    const requests = await db
      .select()
      .from(centerRequests)
      .where(eq(centerRequests.status, "pending"))
      .orderBy(desc(centerRequests.createdAt));

    const result = [];
    for (const req of requests) {
      const [teacher, emails, locations, phones, albums, documents] = await Promise.all([
        db.select().from(users).where(eq(users.id, req.teacherId)).then((r) => r[0] ?? null),
        db.select().from(centerRequestEmails).where(eq(centerRequestEmails.requestId, req.id)),
        db.select().from(centerRequestLocations).where(eq(centerRequestLocations.requestId, req.id)),
        db.select().from(centerRequestPhones).where(eq(centerRequestPhones.requestId, req.id)),
        db.select().from(centerRequestAlbums).where(eq(centerRequestAlbums.requestId, req.id)),
        db.select().from(centerRequestDocuments).where(eq(centerRequestDocuments.requestId, req.id)),
      ]);
      result.push({ ...req, teacher, emails, locations, phones, albums, documents });
    }
    return result;
  }),

  listAll: superAdminQuery.query(async () => {
    const db = getDb();
    const requests = await db
      .select()
      .from(centerRequests)
      .orderBy(desc(centerRequests.createdAt));

    const result = [];
    for (const req of requests) {
      const [teacher, emails, locations, phones, albums, documents] = await Promise.all([
        db.select().from(users).where(eq(users.id, req.teacherId)).then((r) => r[0] ?? null),
        db.select().from(centerRequestEmails).where(eq(centerRequestEmails.requestId, req.id)),
        db.select().from(centerRequestLocations).where(eq(centerRequestLocations.requestId, req.id)),
        db.select().from(centerRequestPhones).where(eq(centerRequestPhones.requestId, req.id)),
        db.select().from(centerRequestAlbums).where(eq(centerRequestAlbums.requestId, req.id)),
        db.select().from(centerRequestDocuments).where(eq(centerRequestDocuments.requestId, req.id)),
      ]);
      result.push({ ...req, teacher, emails, locations, phones, albums, documents });
    }
    return result;
  }),

  approve: superAdminQuery
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [req] = await db
        .select()
        .from(centerRequests)
        .where(eq(centerRequests.id, input.requestId));
      if (!req) throw new TRPCError({ code: "NOT_FOUND" });
      if (req.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "Request already processed" });

      const [center] = await db.insert(centers).values({
        name: req.centerName,
        description: req.centerBio ?? "",
        logo: req.logo,
        adminId: req.teacherId,
        slug: req.slug,
        requestId: req.id,
      });

      const centerId = Number(center.insertId);

      await db.update(users).set({ role: "teacher", centerId }).where(eq(users.id, req.teacherId));

      await db
        .update(centerRequests)
        .set({ status: "approved", reviewedBy: ctx.user.id, reviewedAt: new Date() })
        .where(eq(centerRequests.id, input.requestId));

      return { success: true, centerId, slug: req.slug };
    }),

  reject: superAdminQuery
    .input(z.object({ requestId: z.number(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [req] = await db
        .select()
        .from(centerRequests)
        .where(eq(centerRequests.id, input.requestId));
      if (!req) throw new TRPCError({ code: "NOT_FOUND" });
      if (req.status !== "pending") throw new TRPCError({ code: "CONFLICT", message: "Request already processed" });

      await db
        .update(centerRequests)
        .set({ status: "rejected", adminNotes: input.notes ?? null, reviewedBy: ctx.user.id, reviewedAt: new Date() })
        .where(eq(centerRequests.id, input.requestId));

      return { success: true };
    }),

  checkAdmin: superAdminQuery.query(async () => {
    return { admin: true };
  }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.slug, input.slug));
      if (!center) throw new TRPCError({ code: "NOT_FOUND", message: "Center not found" });

      let teacher: { name: string | null; email: string; avatar: string | null; bio: string | null } | null = null;
      let emails: { id: number; email: string }[] = [];
      let locations: { id: number; country: string; city: string; address: string }[] = [];
      let phones: { id: number; countryCode: string; number: string }[] = [];
      let albums: { id: number; imageUrl: string }[] = [];

      if (center.requestId) {
        const [request] = await db
          .select()
          .from(centerRequests)
          .where(eq(centerRequests.id, center.requestId));
        if (request && request.status === "approved") {
          const [user] = await db
            .select({ name: users.name, email: users.email, avatar: users.avatar, bio: users.bio })
            .from(users)
            .where(eq(users.id, center.adminId));
          if (user) teacher = user;

          [emails, locations, phones, albums] = await Promise.all([
            db.select().from(centerRequestEmails).where(eq(centerRequestEmails.requestId, request.id)),
            db.select().from(centerRequestLocations).where(eq(centerRequestLocations.requestId, request.id)),
            db.select().from(centerRequestPhones).where(eq(centerRequestPhones.requestId, request.id)),
            db.select().from(centerRequestAlbums).where(eq(centerRequestAlbums.requestId, request.id)),
          ]);
        }
      }

      return {
        id: center.id,
        name: center.name,
        description: center.description,
        logo: center.logo,
        slug: center.slug,
        teacher,
        emails,
        locations,
        phones,
        albums,
      };
    }),
});
