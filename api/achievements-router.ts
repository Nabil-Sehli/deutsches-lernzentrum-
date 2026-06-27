import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { achievements, userAchievements, quizAttempts, wordReviews, submissions } from "@db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

const ACHIEVEMENT_DEFS = [
  { key: "first_quiz", requirementType: "quiz_completed", requirementCount: 1 },
  { key: "quiz_5", requirementType: "quiz_completed", requirementCount: 5 },
  { key: "quiz_10", requirementType: "quiz_completed", requirementCount: 10 },
  { key: "perfect_quiz", requirementType: "perfect_quiz", requirementCount: 1 },
  { key: "lessons_5", requirementType: "lesson_completed", requirementCount: 5 },
  { key: "lessons_10", requirementType: "lesson_completed", requirementCount: 10 },
  { key: "lessons_25", requirementType: "lesson_completed", requirementCount: 25 },
  { key: "vocab_50", requirementType: "vocab_reviewed", requirementCount: 50 },
  { key: "vocab_100", requirementType: "vocab_reviewed", requirementCount: 100 },
  { key: "vocab_master_10", requirementType: "vocab_mastered", requirementCount: 10 },
  { key: "assignments_5", requirementType: "assignment_submitted", requirementCount: 5 },
  { key: "level_reached", requirementType: "level_assigned", requirementCount: 1 },
];

export const achievementsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();

    const allAchievements = await db
      .select()
      .from(achievements)
      .orderBy(achievements.id);

    const unlocked = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, ctx.user.id));

    const unlockedSet = new Set(unlocked.map((u) => u.achievementId));

    return allAchievements.map((a) => ({
      ...a,
      unlocked: unlockedSet.has(a.id),
      unlockedAt: unlocked.find((u) => u.achievementId === a.id)?.unlockedAt ?? null,
    }));
  }),

  check: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();

    const allAchievements = await db
      .select()
      .from(achievements)
      .orderBy(achievements.id);

    const unlocked = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, ctx.user.id));

    const unlockedKeys = new Set(
      unlocked.map((u) => allAchievements.find((a) => a.id === u.achievementId)?.key)
    );

    const quizAttemptsData = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.studentId, ctx.user.id));

    const totalQuizzes = quizAttemptsData.length;
    const perfectQuizzes = quizAttemptsData.filter((a) => a.score === a.totalQuestions).length;
    const uniqueLessons = new Set(quizAttemptsData.map((a) => a.lessonId)).size;

    const vocabReviews = await db
      .select()
      .from(wordReviews)
      .where(eq(wordReviews.studentId, ctx.user.id));

    const totalVocabReviewed = vocabReviews.length;
    const vocabMastered = vocabReviews.filter((r) => r.repetitions >= 5).length;

    const assignmentSubmissions = await db
      .select()
      .from(submissions)
      .where(eq(submissions.studentId, ctx.user.id));

    const totalAssignments = assignmentSubmissions.length;

    const hasLevel = !!ctx.user.level;

    function computeProgress(def: typeof ACHIEVEMENT_DEFS[number]): number {
      switch (def.requirementType) {
        case "quiz_completed": return Math.min(totalQuizzes, def.requirementCount);
        case "perfect_quiz": return Math.min(perfectQuizzes, def.requirementCount);
        case "lesson_completed": return Math.min(uniqueLessons, def.requirementCount);
        case "vocab_reviewed": return Math.min(totalVocabReviewed, def.requirementCount);
        case "vocab_mastered": return Math.min(vocabMastered, def.requirementCount);
        case "assignment_submitted": return Math.min(totalAssignments, def.requirementCount);
        case "level_assigned": return hasLevel ? def.requirementCount : 0;
        default: return 0;
      }
    }

    function checkMet(def: typeof ACHIEVEMENT_DEFS[number]): boolean {
      return computeProgress(def) >= def.requirementCount;
    }

    const newlyUnlocked: { key: string; name: string; icon: string | null }[] = [];

    for (const def of ACHIEVEMENT_DEFS) {
      if (unlockedKeys.has(def.key)) continue;
      if (!checkMet(def)) continue;

      const achievement = allAchievements.find((a) => a.key === def.key);
      if (!achievement) continue;

      await db.insert(userAchievements).values({
        userId: ctx.user.id,
        achievementId: achievement.id,
      });

      newlyUnlocked.push({
        key: achievement.key,
        name: achievement.name,
        icon: achievement.icon,
      });
    }

    const allWithStatus = allAchievements.map((a) => {
      const def = ACHIEVEMENT_DEFS.find((d) => d.key === a.key);
      const isUnlocked = unlockedKeys.has(a.key) || newlyUnlocked.some((n) => n.key === a.key);
      return {
        ...a,
        unlocked: isUnlocked,
        progress: def ? computeProgress(def) : 0,
        unlockedAt: isUnlocked
          ? (unlocked.find((u) => u.achievementId === a.id)?.unlockedAt ?? new Date())
          : null,
      };
    });

    return {
      newlyUnlocked,
      achievements: allWithStatus,
    };
  }),
});
