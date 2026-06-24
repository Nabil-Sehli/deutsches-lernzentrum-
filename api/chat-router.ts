import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatMessages, users } from "@db/schema";
import { eq, desc, and, ne, isNull, SQL } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createNotification } from "./lib/notifications";

export const chatRouter = createRouter({
  list: authedQuery
    .input(z.object({ level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) return [];
      const conditions: SQL[] = [eq(chatMessages.centerId, ctx.user.centerId)];

      if (input?.level) {
        conditions.push(eq(chatMessages.level, input.level as any));
      } else {
        conditions.push(isNull(chatMessages.level));
      }

      const messages = await db
        .select({
          id: chatMessages.id,
          centerId: chatMessages.centerId,
          userId: chatMessages.userId,
          message: chatMessages.message,
          imageUrl: chatMessages.imageUrl,
          level: chatMessages.level,
          reactions: chatMessages.reactions,
          createdAt: chatMessages.createdAt,
          userName: users.name,
          userTitle: users.title,
          userAvatar: users.avatar,
        })
        .from(chatMessages)
        .leftJoin(users, eq(chatMessages.userId, users.id))
        .where(and(...conditions))
        .orderBy(desc(chatMessages.createdAt))
        .limit(50);
      return messages.reverse().map((m) => ({
        ...m,
        userName: m.userTitle ? `${m.userTitle}. ${m.userName}` : m.userName,
        reactions: (m.reactions ?? []) as { emoji: string; userId: number; userName: string }[],
      }));
    }),

  send: authedQuery
    .input(z.object({ message: z.string().max(2000).default(""), imageUrl: z.string().max(1024).optional(), level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional().nullable() }).refine(d => d.message || d.imageUrl, { message: "Either message or imageUrl is required" }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });

      const [msg] = await db.insert(chatMessages).values({
        centerId: ctx.user.centerId,
        userId: ctx.user.id,
        message: input.message,
        imageUrl: input.imageUrl ?? null,
        level: input.level ?? null,
        reactions: [],
      });

      const centerUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.centerId, ctx.user.centerId), ne(users.id, ctx.user.id)));

      await Promise.all(centerUsers.map(u =>
        createNotification(u.id, "new_message", "New chat message", `${ctx.user.name ?? "Someone"} sent a message in the center chat`, "/dashboard")
      ));

      return { id: msg.insertId };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });
      const [msg] = await db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.id, input.id), eq(chatMessages.centerId, ctx.user.centerId)));
      if (!msg) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      if (msg.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN", message: "You can only delete your own messages" });

      await db.delete(chatMessages).where(eq(chatMessages.id, input.id));
      return { success: true };
    }),

  react: authedQuery
    .input(z.object({ id: z.number(), emoji: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });
      const [msg] = await db
        .select()
        .from(chatMessages)
        .where(and(eq(chatMessages.id, input.id), eq(chatMessages.centerId, ctx.user.centerId)));
      if (!msg) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });

      const reactions = (msg.reactions ?? []) as { emoji: string; userId: number; userName: string }[];
      const existingIdx = reactions.findIndex((r) => r.emoji === input.emoji && r.userId === ctx.user.id);

      if (existingIdx >= 0) {
        reactions.splice(existingIdx, 1);
      } else {
        reactions.push({ emoji: input.emoji, userId: ctx.user.id, userName: ctx.user.title ? `${ctx.user.title}. ${ctx.user.name ?? "Unknown"}` : (ctx.user.name ?? "Unknown") });
      }

      await db.update(chatMessages).set({ reactions }).where(eq(chatMessages.id, input.id));
      return { reactions };
    }),
});
