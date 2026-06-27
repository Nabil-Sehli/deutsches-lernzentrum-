import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { quizAttempts, questions, lessons, users } from "@db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const quizRouter = createRouter({
  submit: authedQuery
    .input(
      z.object({
        lessonId: z.number(),
        answers: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const lessonQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.lessonId, input.lessonId));

      if (lessonQuestions.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No questions found for this lesson" });
      }

      if (input.answers.length !== lessonQuestions.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Please answer all questions" });
      }

      let score = 0;
      const sortedQuestions = lessonQuestions.sort((a, b) => a.id - b.id);
      for (let i = 0; i < sortedQuestions.length; i++) {
        if (input.answers[i] === sortedQuestions[i].correctAnswerIndex) {
          score++;
        }
      }

      const [attempt] = await db.insert(quizAttempts).values({
        studentId: ctx.user.id,
        lessonId: input.lessonId,
        score,
        totalQuestions: lessonQuestions.length,
        answers: input.answers,
      });

      return {
        attemptId: attempt.insertId,
        score,
        totalQuestions: lessonQuestions.length,
        percentage: Math.round((score / lessonQuestions.length) * 100),
      };
    }),

  myAttempts: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, ctx.user.id))
      .orderBy(desc(quizAttempts.completedAt));

    const results = [];
    for (const attempt of attempts) {
      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, attempt.lessonId));
      results.push({
        ...attempt,
        lessonTitle: lesson?.title ?? "Unknown Lesson",
      });
    }
    return results;
  }),

  progressDashboard: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const attempts = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, ctx.user.id))
      .orderBy(quizAttempts.completedAt);

    const lessonIds = [...new Set(attempts.map((a) => a.lessonId))];
    const centerLessons = lessonIds.length > 0
      ? await db
          .select()
          .from(lessons)
          .where(inArray(lessons.id, lessonIds))
      : [];
    const lessonMap = new Map(centerLessons.map((l) => [l.id, l]));

    const scoresOverTime = attempts.map((a) => {
      const lesson = lessonMap.get(a.lessonId);
      return {
        date: a.completedAt,
        score: Math.round((a.score / a.totalQuestions) * 100),
        lessonTitle: lesson?.title ?? "Unknown",
        lessonLevel: lesson?.level ?? null,
      };
    });

    const levelStats: Record<string, { total: number; scoreSum: number; lessons: Set<number> }> = {};
    for (const a of attempts) {
      const lesson = lessonMap.get(a.lessonId);
      const lvl = lesson?.level ?? "unknown";
      if (!levelStats[lvl]) levelStats[lvl] = { total: 0, scoreSum: 0, lessons: new Set() };
      levelStats[lvl].total++;
      levelStats[lvl].scoreSum += Math.round((a.score / a.totalQuestions) * 100);
      levelStats[lvl].lessons.add(a.lessonId);
    }

    const levelBreakdown = Object.entries(levelStats).map(([level, data]) => ({
      level,
      attempts: data.total,
      avgScore: Math.round(data.scoreSum / data.total),
      lessonsCompleted: data.lessons.size,
    }));

    const lessonsCompleted = new Set(attempts.map((a) => a.lessonId)).size;
    const totalQuizzes = attempts.length;
    const avgScore = totalQuizzes > 0
      ? Math.round(attempts.reduce((s, a) => s + (a.score / a.totalQuestions) * 100, 0) / totalQuizzes)
      : 0;

    return {
      scoresOverTime,
      levelBreakdown,
      lessonsCompleted,
      totalQuizzes,
      avgScore,
      currentLevel: ctx.user.level ?? null,
    };
  }),

  lessonAttempts: authedQuery
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db
        .select()
        .from(quizAttempts)
        .where(
          and(
            eq(quizAttempts.lessonId, input.lessonId),
            eq(quizAttempts.studentId, ctx.user.id)
          )
        )
        .orderBy(desc(quizAttempts.completedAt));
    }),

  getAttempt: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const [attempt] = await db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.id, input.id));
      if (!attempt || attempt.studentId !== ctx.user.id) return null;

      const lessonQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.lessonId, attempt.lessonId));

      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, attempt.lessonId));

      return {
        ...attempt,
        lessonTitle: lesson?.title ?? "Unknown",
        questions: lessonQuestions.sort((a, b) => a.id - b.id),
      };
    }),

  centerAnalytics: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return null;

    const centerLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.centerId, ctx.user.centerId));

    const allAttempts = [];
    for (const lesson of centerLessons) {
      const attempts = await db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.lessonId, lesson.id));
      for (const attempt of attempts) {
        const [student] = await db
          .select()
          .from(users)
          .where(eq(users.id, attempt.studentId));
        allAttempts.push({
          ...attempt,
          lessonTitle: lesson.title,
          studentName: student?.name ?? "Unknown",
          studentLevel: student?.level ?? null,
        });
      }
    }

    return allAttempts.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime()
    );
  }),
});
