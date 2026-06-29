import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { dailyActivity, quizAttempts, wordReviews, submissions, users } from "@db/schema";
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

  leaderboard: authedQuery
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) return [];

      const limit = input?.limit ?? 10;

      const students = await db
        .select({ id: users.id, name: users.name, level: users.level, avatar: users.avatar })
        .from(users)
        .where(and(eq(users.centerId, ctx.user.centerId), eq(users.role, "student")));

      const studentIds = students.map((s) => s.id);
      if (studentIds.length === 0) return [];

      const allAttempts = await db
        .select()
        .from(quizAttempts)
        .where(sql`${quizAttempts.studentId} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`);

      const allReviews = await db
        .select()
        .from(wordReviews)
        .where(sql`${wordReviews.studentId} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`);

      const allSubmissions = await db
        .select()
        .from(submissions)
        .where(sql`${submissions.studentId} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`);

      const allDailyActivity = await db
        .select()
        .from(dailyActivity)
        .where(sql`${dailyActivity.userId} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`);

      const rankings = students.map((student) => {
        const quizAttemptsForStudent = allAttempts.filter((a) => a.studentId === student.id);
        const reviewsForStudent = allReviews.filter((r) => r.studentId === student.id);
        const submissionsForStudent = allSubmissions.filter((s) => s.studentId === student.id);
        const activityForStudent = allDailyActivity.filter((d) => d.userId === student.id);

        const uniqueLessons = new Set(quizAttemptsForStudent.map((a) => a.lessonId)).size;

        const quizPoints = quizAttemptsForStudent.reduce((sum, a) => {
          const score = a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0;
          return sum + 50 + Math.round(score * 0.5);
        }, 0);

        const vocabPoints = reviewsForStudent.length * 10;

        const submissionPoints = submissionsForStudent.length * 30;

        const dateStrs = activityForStudent.map((d) => toDateStr(d.date));
        const today = todayString();
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

        const streakBonus = currentStreak * 5;
        const totalPoints = quizPoints + vocabPoints + submissionPoints + streakBonus;

        return {
          studentId: student.id,
          studentName: student.name,
          studentLevel: student.level,
          studentAvatar: student.avatar,
          totalPoints,
          quizPoints,
          vocabPoints,
          submissionPoints,
          streakBonus,
          currentStreak,
          lessonsCompleted: uniqueLessons,
          isCurrentUser: student.id === ctx.user.id,
        };
      });

      rankings.sort((a, b) => b.totalPoints - a.totalPoints);

      return rankings.slice(0, limit);
    }),
});
