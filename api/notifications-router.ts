import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { notifications } from "@db/schema";
import { eq, desc, and, count } from "drizzle-orm";


export const notificationsRouter = createRouter({
  list: authedQuery
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit);
    }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [row] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false)));
    return row.count;
  }),

  markRead: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      return { success: true };
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, ctx.user.id), eq(notifications.read, false)));
    return { success: true };
  }),
});
