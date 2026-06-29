import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dailyActivity } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function toDateStr(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

async function logActivity(userId: number) {
  const db = getDb();
  const today = todayString();

  const [existing] = await db
    .select()
    .from(dailyActivity)
    .where(and(eq(dailyActivity.userId, userId), eq(dailyActivity.date, today)));

  if (existing) {
    await db
      .update(dailyActivity)
      .set({ activityCount: existing.activityCount + 1, updatedAt: new Date() })
      .where(eq(dailyActivity.id, existing.id));
  } else {
    await db.insert(dailyActivity).values({ userId, date: today, activityCount: 1 });
  }
}

async function getStreakStats(userId: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(dailyActivity)
    .where(eq(dailyActivity.userId, userId))
    .orderBy(sql`date DESC`);

  const dateStrs = rows.map((r) => toDateStr(r.date));
  const today = todayString();
  const totalActiveDays = dateStrs.length;

  let currentStreak = 0;
  if (dateStrs.length > 0) {
    const diff = daysBetween(today, dateStrs[0]);
    if (diff <= 1) {
      currentStreak = 1;
      for (let i = 1; i < dateStrs.length; i++) {
        const d = daysBetween(dateStrs[i - 1], dateStrs[i]);
        if (d === 1) currentStreak++;
        else break;
      }
    }
  }

  let longestStreak = 0;
  if (dateStrs.length > 0) {
    let streak = 1;
    longestStreak = 1;
    for (let i = 1; i < dateStrs.length; i++) {
      const d = daysBetween(dateStrs[i - 1], dateStrs[i]);
      if (d === 1) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 1;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    todayActive: dateStrs.length > 0 && dateStrs[0] === today,
  };
}

export const activityRouter = createRouter({
  log: authedQuery.mutation(async ({ ctx }) => {
    await logActivity(ctx.user.id);
    return getStreakStats(ctx.user.id);
  }),

  stats: authedQuery.query(async ({ ctx }) => {
    return getStreakStats(ctx.user.id);
  }),

  weekly: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const week: { label: string; value: number; date: string }[] = [];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const rows = await db
      .select()
      .from(dailyActivity)
      .where(eq(dailyActivity.userId, ctx.user.id))
      .orderBy(sql`date ASC`);

    const activityByDate = new Map<string, number>();
    for (const r of rows) {
      activityByDate.set(toDateStr(r.date), r.activityCount);
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateStr(d);
      const dayOfWeek = d.getDay();
      const label = dayLabels[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
      week.push({ label, value: activityByDate.get(key) ?? 0, date: key });
    }

    return week;
  }),
});
