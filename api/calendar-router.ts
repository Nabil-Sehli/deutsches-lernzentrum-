import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { calendarEvents, meetingRooms, assignments } from "@db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const calendarRouter = createRouter({
  list: authedQuery
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) return [];

      const startDate = input.startDate ? new Date(input.startDate) : new Date();
      const endDate = input.endDate
        ? new Date(input.endDate)
        : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      return db
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.centerId, centerId),
            gte(calendarEvents.startTime, startDate),
            lte(calendarEvents.startTime, endDate),
          )
        )
        .orderBy(calendarEvents.startTime);
    }),

  create: authedQuery
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      startTime: z.string(),
      endTime: z.string().optional(),
      type: z.enum(["lesson", "meeting", "assignment_due", "custom"]),
      level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional(),
      meetingRoomId: z.number().optional(),
      assignmentId: z.number().optional(),
      color: z.string().max(7).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      const [ev] = await db.insert(calendarEvents).values({
        centerId,
        title: input.title,
        description: input.description ?? null,
        startTime: new Date(input.startTime),
        endTime: input.endTime ? new Date(input.endTime) : null,
        type: input.type,
        level: input.level ?? null,
        createdById: ctx.user.id,
        meetingRoomId: input.meetingRoomId ?? null,
        assignmentId: input.assignmentId ?? null,
        color: input.color ?? null,
      });
      return { id: ev.insertId };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional().nullable(),
      startTime: z.string().optional(),
      endTime: z.string().optional().nullable(),
      type: z.enum(["lesson", "meeting", "assignment_due", "custom"]).optional(),
      level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional().nullable(),
      color: z.string().max(7).optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [ev] = await db
        .select()
        .from(calendarEvents)
        .where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.centerId, centerId)));
      if (!ev) throw new TRPCError({ code: "NOT_FOUND" });

      await db.update(calendarEvents).set({
        title: input.title ?? ev.title,
        description: input.description !== undefined ? input.description : ev.description,
        startTime: input.startTime ? new Date(input.startTime) : ev.startTime,
        endTime: input.endTime !== undefined ? (input.endTime ? new Date(input.endTime) : null) : ev.endTime,
        type: input.type ?? ev.type,
        level: input.level !== undefined ? input.level : ev.level,
        color: input.color !== undefined ? input.color : ev.color,
      }).where(eq(calendarEvents.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });
      const [ev] = await db
        .select()
        .from(calendarEvents)
        .where(and(eq(calendarEvents.id, input.id), eq(calendarEvents.centerId, centerId)));
      if (!ev) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(calendarEvents).where(eq(calendarEvents.id, input.id));
      return { success: true };
    }),

  syncMeetings: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const centerId = ctx.user.centerId;
    if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });

    const rooms = await db
      .select()
      .from(meetingRooms)
      .where(eq(meetingRooms.centerId, centerId));

    for (const room of rooms) {
      if (!room.scheduledAt) continue;
      const [existing] = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.meetingRoomId, room.id));
      if (existing) continue;

      await db.insert(calendarEvents).values({
        centerId,
        title: room.name,
        description: room.description,
        startTime: room.scheduledAt,
        endTime: new Date(room.scheduledAt.getTime() + 60 * 60 * 1000),
        type: "meeting",
        createdById: ctx.user.id,
        meetingRoomId: room.id,
        color: "#00695c",
      });
    }
    return { success: true };
  }),

  syncAssignments: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const centerId = ctx.user.centerId;
    if (!centerId) throw new TRPCError({ code: "NOT_FOUND" });

    const assignList = await db
      .select()
      .from(assignments)
      .where(eq(assignments.centerId, centerId));

    for (const a of assignList) {
      if (!a.dueDate) continue;
      const [existing] = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.assignmentId, a.id));
      if (existing) continue;

      await db.insert(calendarEvents).values({
        centerId,
        title: `Due: ${a.title}`,
        description: a.description,
        startTime: a.dueDate,
        type: "assignment_due",
        level: a.level,
        createdById: ctx.user.id,
        assignmentId: a.id,
        color: "#e53935",
      });
    }
    return { success: true };
  }),
});
