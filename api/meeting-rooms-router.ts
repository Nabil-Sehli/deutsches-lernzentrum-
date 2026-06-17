import { z } from "zod";
import { createRouter, publicQuery, authedQuery, getCenterPlan } from "./middleware";
import { getDb } from "./queries/connection";
import { meetingRooms } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const meetingRoomsRouter = createRouter({
  listByCenter: publicQuery
    .input(z.object({ centerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(meetingRooms)
        .where(eq(meetingRooms.centerId, input.centerId))
        .orderBy(meetingRooms.createdAt);
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return [];
    return db
      .select()
      .from(meetingRooms)
      .where(eq(meetingRooms.centerId, ctx.user.centerId))
      .orderBy(meetingRooms.createdAt);
  }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        url: z.string().min(1).max(512),
        scheduledAt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      const { plan } = await getCenterPlan(ctx.user.centerId);
      if (plan !== "premium") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Meeting rooms are only available on the Premium plan. Upgrade to use this feature.",
        });
      }

      const [room] = await db.insert(meetingRooms).values({
        centerId: ctx.user.centerId,
        name: input.name,
        description: input.description ?? "",
        url: input.url,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      });
      return { id: room.insertId, name: input.name };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        url: z.string().min(1).max(512).optional(),
        scheduledAt: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [room] = await db
        .select()
        .from(meetingRooms)
        .where(eq(meetingRooms.id, input.id));
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Meeting room not found" });
      if (ctx.user.centerId !== room.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await db
        .update(meetingRooms)
        .set({
          name: input.name ?? room.name,
          description: input.description ?? room.description,
          url: input.url ?? room.url,
          scheduledAt: input.scheduledAt !== undefined ? (input.scheduledAt ? new Date(input.scheduledAt) : null) : room.scheduledAt,
        })
        .where(eq(meetingRooms.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [room] = await db
        .select()
        .from(meetingRooms)
        .where(eq(meetingRooms.id, input.id));
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Meeting room not found" });
      if (ctx.user.centerId !== room.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }
      await db.delete(meetingRooms).where(eq(meetingRooms.id, input.id));
      return { success: true };
    }),
});
