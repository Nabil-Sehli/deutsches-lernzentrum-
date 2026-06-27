import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { vocabularyWords, wordReviews } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function sm2(quality: number, prevEase: number, prevInterval: number, prevRepetitions: number) {
  let ease = prevEase;
  let interval = prevInterval;
  let reps = prevRepetitions;

  if (quality < 3) {
    reps = 0;
    interval = 0;
  } else {
    const ef = ease / 100;
    const newEf = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    ease = Math.max(130, Math.round(newEf * 100));
    reps += 1;

    if (reps === 1) {
      interval = 1;
    } else if (reps === 2) {
      interval = 6;
    } else {
      interval = Math.round(prevInterval * (ease / 100));
    }
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + (interval || 1));
  nextReviewAt.setHours(0, 0, 0, 0);

  return { ease, interval, repetitions: reps, nextReviewAt };
}

export const vocabularyRouter = createRouter({
  listByLesson: authedQuery
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(vocabularyWords)
        .where(eq(vocabularyWords.lessonId, input.lessonId))
        .orderBy(vocabularyWords.word);
    }),

  listByLevel: authedQuery
    .input(z.object({
      level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]),
      lessonId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(vocabularyWords.level, input.level)];
      if (input.lessonId) {
        conditions.push(eq(vocabularyWords.lessonId, input.lessonId));
      }
      return db
        .select()
        .from(vocabularyWords)
        .where(and(...conditions))
        .orderBy(vocabularyWords.word);
    }),

  listDue: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId || ctx.user.role !== "student") return [];

    const now = new Date();

    const allWords = await db
      .select()
      .from(vocabularyWords)
      .where(and(
        eq(vocabularyWords.centerId, ctx.user.centerId),
        eq(vocabularyWords.level, ctx.user.level ?? "a1"),
      ))
      .orderBy(vocabularyWords.word);

    const reviews = await db
      .select()
      .from(wordReviews)
      .where(eq(wordReviews.studentId, ctx.user.id));

    const reviewMap = new Map(reviews.map((r) => [r.wordId, r]));

    const due: typeof allWords = [];
    const soon: typeof allWords = [];
    const unstarted: typeof allWords = [];

    for (const w of allWords) {
      const r = reviewMap.get(w.id);
      if (!r) {
        unstarted.push(w);
      } else if (new Date(r.nextReviewAt) <= now) {
        due.push(w);
      } else {
        soon.push(w);
      }
    }

    soon.sort((a, b) => {
      const ra = reviewMap.get(a.id)!;
      const rb = reviewMap.get(b.id)!;
      return new Date(ra.nextReviewAt).getTime() - new Date(rb.nextReviewAt).getTime();
    });

    return [...due, ...unstarted, ...soon];
  }),

  create: authedQuery
    .input(z.object({
      word: z.string().min(1).max(255),
      translation: z.string().min(1).max(255),
      example: z.string().optional(),
      partOfSpeech: z.string().max(50).optional(),
      level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]),
      lessonId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const centerId = ctx.user.centerId;
      if (!centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      const [w] = await db.insert(vocabularyWords).values({
        centerId,
        word: input.word,
        translation: input.translation,
        example: input.example ?? null,
        partOfSpeech: input.partOfSpeech ?? null,
        level: input.level,
        lessonId: input.lessonId ?? null,
      });
      return { id: w.insertId };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      word: z.string().min(1).max(255).optional(),
      translation: z.string().min(1).max(255).optional(),
      example: z.string().optional().nullable(),
      partOfSpeech: z.string().max(50).optional().nullable(),
      level: z.enum(["a1", "a2", "b1", "b2", "c1", "c2"]).optional(),
      lessonId: z.number().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [w] = await db.select().from(vocabularyWords).where(eq(vocabularyWords.id, input.id));
      if (!w || w.centerId !== ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND" });

      await db.update(vocabularyWords).set({
        word: input.word ?? w.word,
        translation: input.translation ?? w.translation,
        example: input.example !== undefined ? input.example : w.example,
        partOfSpeech: input.partOfSpeech !== undefined ? input.partOfSpeech : w.partOfSpeech,
        level: input.level ?? w.level,
        lessonId: input.lessonId !== undefined ? input.lessonId : w.lessonId,
      }).where(eq(vocabularyWords.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [w] = await db.select().from(vocabularyWords).where(eq(vocabularyWords.id, input.id));
      if (!w || w.centerId !== ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND" });
      await db.delete(vocabularyWords).where(eq(vocabularyWords.id, input.id));
      return { success: true };
    }),

  recordReview: authedQuery
    .input(z.object({
      wordId: z.number(),
      quality: z.number().min(0).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.role !== "student") throw new TRPCError({ code: "FORBIDDEN" });

      const [word] = await db.select().from(vocabularyWords).where(eq(vocabularyWords.id, input.wordId));
      if (!word) throw new TRPCError({ code: "NOT_FOUND" });

      const [existing] = await db
        .select()
        .from(wordReviews)
        .where(and(eq(wordReviews.wordId, input.wordId), eq(wordReviews.studentId, ctx.user.id)));

      const prevEase = existing?.ease ?? 250;
      const prevInterval = existing?.interval ?? 0;
      const prevReps = existing?.repetitions ?? 0;

      const { ease, interval, repetitions, nextReviewAt } = sm2(
        input.quality,
        prevEase,
        prevInterval,
        prevReps,
      );

      if (existing) {
        await db.update(wordReviews).set({
          ease,
          interval,
          repetitions,
          nextReviewAt,
          lastReviewAt: new Date(),
        }).where(eq(wordReviews.id, existing.id));
      } else {
        await db.insert(wordReviews).values({
          wordId: input.wordId,
          studentId: ctx.user.id,
          ease,
          interval,
          repetitions,
          nextReviewAt,
          lastReviewAt: new Date(),
        });
      }

      return { nextReviewAt, ease, interval, repetitions };
    }),

  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (ctx.user.role !== "student") return { total: 0, due: 0, mastered: 0 };

    const now = new Date();
    const all = await db
      .select()
      .from(wordReviews)
      .where(eq(wordReviews.studentId, ctx.user.id));

    const total = all.length;
    const due = all.filter((r) => new Date(r.nextReviewAt) <= now).length;
    const mastered = all.filter((r) => r.repetitions >= 5).length;

    return { total, due, mastered };
  }),
});
