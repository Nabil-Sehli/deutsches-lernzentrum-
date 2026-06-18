import { z } from "zod";
import { createRouter, publicQuery, authedQuery, getCenterPlan } from "./middleware";
import { getDb } from "./queries/connection";
import { meetingRooms, meetingRoomMessages, users } from "@db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createDailyRoom } from "./lib/meeting";
import { createNotification } from "./lib/notifications";

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

      const daily = await createDailyRoom(input.name);
      if (!daily) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create meeting room. Check DAILY_API_KEY.",
        });
      }

      const [room] = await db.insert(meetingRooms).values({
        centerId: ctx.user.centerId,
        name: input.name,
        description: input.description ?? "",
        url: daily.url,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      });

      if (input.scheduledAt) {
        const centerUsers = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.centerId, ctx.user.centerId), ne(users.id, ctx.user.id)));

        const dateStr = new Date(input.scheduledAt).toLocaleDateString();
        await Promise.all(centerUsers.map(u =>
          createNotification(u.id, "upcoming_meeting", "Upcoming meeting", `"${input.name}" is scheduled for ${dateStr}`, "/dashboard")
        ));
      }

      return { id: room.insertId, name: input.name, url: daily.url };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
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

  // ── Room Messages ──

  messages: authedQuery
    .input(z.object({ roomId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) return [];

      const [room] = await db
        .select()
        .from(meetingRooms)
        .where(and(eq(meetingRooms.id, input.roomId), eq(meetingRooms.centerId, ctx.user.centerId)));
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Meeting room not found" });

      const messages = await db
        .select({
          id: meetingRoomMessages.id,
          roomId: meetingRoomMessages.roomId,
          userId: meetingRoomMessages.userId,
          message: meetingRoomMessages.message,
          imageUrl: meetingRoomMessages.imageUrl,
          reactions: meetingRoomMessages.reactions,
          createdAt: meetingRoomMessages.createdAt,
          userName: users.name,
          userTitle: users.title,
          userAvatar: users.avatar,
        })
        .from(meetingRoomMessages)
        .leftJoin(users, eq(meetingRoomMessages.userId, users.id))
        .where(eq(meetingRoomMessages.roomId, input.roomId))
        .orderBy(desc(meetingRoomMessages.createdAt))
        .limit(50);

      return messages.reverse().map((m) => ({
        ...m,
        userName: m.userTitle ? `${m.userTitle}. ${m.userName}` : m.userName,
        reactions: (m.reactions ?? []) as { emoji: string; userId: number; userName: string }[],
      }));
    }),

  sendMessage: authedQuery
    .input(z.object({
      roomId: z.number(),
      message: z.string().max(2000).default(""),
      imageUrl: z.string().max(1024).optional(),
    }).refine(d => d.message || d.imageUrl, { message: "Either message or imageUrl is required" }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });

      const [room] = await db
        .select()
        .from(meetingRooms)
        .where(and(eq(meetingRooms.id, input.roomId), eq(meetingRooms.centerId, ctx.user.centerId)));
      if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Meeting room not found" });

      const [msg] = await db.insert(meetingRoomMessages).values({
        roomId: input.roomId,
        userId: ctx.user.id,
        message: input.message,
        imageUrl: input.imageUrl ?? null,
        reactions: [],
      });
      return { id: msg.insertId };
    }),

  deleteMessage: authedQuery
    .input(z.object({ id: z.number(), roomId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });

      const [msg] = await db
        .select()
        .from(meetingRoomMessages)
        .where(and(eq(meetingRoomMessages.id, input.id), eq(meetingRoomMessages.roomId, input.roomId)));
      if (!msg) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      if (msg.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own messages" });

      await db.delete(meetingRoomMessages).where(eq(meetingRoomMessages.id, input.id));
      return { success: true };
    }),

  reactMessage: authedQuery
    .input(z.object({ id: z.number(), roomId: z.number(), emoji: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });

      const [msg] = await db
        .select()
        .from(meetingRoomMessages)
        .where(and(eq(meetingRoomMessages.id, input.id), eq(meetingRoomMessages.roomId, input.roomId)));
      if (!msg) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });

      const reactions = (msg.reactions ?? []) as { emoji: string; userId: number; userName: string }[];
      const existingIdx = reactions.findIndex((r) => r.emoji === input.emoji && r.userId === ctx.user.id);

      if (existingIdx >= 0) {
        reactions.splice(existingIdx, 1);
      } else {
        reactions.push({ emoji: input.emoji, userId: ctx.user.id, userName: ctx.user.title ? `${ctx.user.title}. ${ctx.user.name ?? "Unknown"}` : (ctx.user.name ?? "Unknown") });
      }

      await db.update(meetingRoomMessages).set({ reactions }).where(eq(meetingRoomMessages.id, input.id));
      return { reactions };
    }),
});
