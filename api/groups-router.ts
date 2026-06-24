import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { groups, groupMembers, users } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const groupsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const centerId = ctx.user.centerId;
    if (!centerId) return [];
    return db
      .select()
      .from(groups)
      .where(eq(groups.centerId, centerId))
      .orderBy(groups.name);
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [group] = await db
        .select()
        .from(groups)
        .where(and(eq(groups.id, input.id), eq(groups.centerId, centerId)));
      if (!group) throw new TRPCError({ code: "NOT_FOUND" });
      return group;
    }),

  create: authedQuery
    .input(z.object({
      name: z.string().min(1).max(255),
      level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      const [g] = await db.insert(groups).values({
        centerId,
        name: input.name,
        level: input.level ?? null,
      });
      return { id: g.insertId };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [g] = await db
        .select()
        .from(groups)
        .where(and(eq(groups.id, input.id), eq(groups.centerId, centerId)));
      if (!g) throw new TRPCError({ code: "NOT_FOUND" });

      await db.update(groups).set({
        name: input.name ?? g.name,
        level: input.level !== undefined ? input.level : g.level,
      }).where(eq(groups.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [g] = await db
        .select()
        .from(groups)
        .where(and(eq(groups.id, input.id), eq(groups.centerId, centerId)));
      if (!g) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(groupMembers).where(eq(groupMembers.groupId, input.id));
      await db.delete(groups).where(eq(groups.id, input.id));
      return { success: true };
    }),

  members: authedQuery
    .input(z.object({ groupId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [g] = await db
        .select()
        .from(groups)
        .where(and(eq(groups.id, input.groupId), eq(groups.centerId, centerId)));
      if (!g) throw new TRPCError({ code: "NOT_FOUND" });

      return db
        .select({
          id: groupMembers.id,
          studentId: groupMembers.studentId,
          createdAt: groupMembers.createdAt,
          studentName: users.name,
          studentEmail: users.email,
          studentLevel: users.level,
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.studentId, users.id))
        .where(eq(groupMembers.groupId, input.groupId));
    }),

  addStudent: authedQuery
    .input(z.object({ groupId: z.number(), studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [g] = await db
        .select()
        .from(groups)
        .where(and(eq(groups.id, input.groupId), eq(groups.centerId, centerId)));
      if (!g) throw new TRPCError({ code: "NOT_FOUND" });

      const [student] = await db
        .select()
        .from(users)
        .where(and(eq(users.id, input.studentId), eq(users.centerId, centerId)));
      if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "Student not found in your center" });

      const [existing] = await db
        .select()
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.studentId, input.studentId)));
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Student is already in this group" });

      await db.insert(groupMembers).values({
        groupId: input.groupId,
        studentId: input.studentId,
      });
      return { success: true };
    }),

  removeStudent: authedQuery
    .input(z.object({ groupId: z.number(), studentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [g] = await db
        .select()
        .from(groups)
        .where(and(eq(groups.id, input.groupId), eq(groups.centerId, centerId)));
      if (!g) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(groupMembers)
        .where(and(eq(groupMembers.groupId, input.groupId), eq(groupMembers.studentId, input.studentId)));
      return { success: true };
    }),

  myGroupIds: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId || ctx.user.role !== "student") return [];
    const rows = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.studentId, ctx.user.id));
    return rows.map((r) => r.groupId);
  }),
});
