import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews, users, quizAttempts, lessons } from "@db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = createRouter({
  listByCenter: publicQuery
    .input(z.object({ centerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          text: reviews.text,
          createdAt: reviews.createdAt,
          studentName: users.name,
          studentTitle: users.title,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.studentId, users.id))
        .where(eq(reviews.centerId, input.centerId))
        .orderBy(desc(reviews.createdAt));
    }),

  stats: publicQuery
    .input(z.object({ centerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const allReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.centerId, input.centerId));

      const avgRating = allReviews.length > 0
        ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 10) / 10
        : null;

      return {
        total: allReviews.length,
        average: avgRating,
        distribution: [1, 2, 3, 4, 5].map((star) => ({
          rating: star,
          count: allReviews.filter((r) => r.rating === star).length,
        })),
      };
    }),

  create: authedQuery
    .input(z.object({
      centerId: z.number(),
      rating: z.number().min(1).max(5),
      text: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.role !== "student") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only students can leave reviews" });
      }
      if (!ctx.user.centerId || ctx.user.centerId !== input.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only review your own center" });
      }

      // Check student has completed at least one lesson
      const [attempt] = await db
        .select({ count: count() })
        .from(quizAttempts)
        .innerJoin(lessons, eq(quizAttempts.lessonId, lessons.id))
        .where(and(
          eq(quizAttempts.studentId, ctx.user.id),
          eq(lessons.centerId, input.centerId),
        ));

      if (attempt.count === 0) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You must complete at least one lesson before leaving a review" });
      }

      // Check not already reviewed
      const [existing] = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.studentId, ctx.user.id), eq(reviews.centerId, input.centerId)));
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You have already reviewed this center" });
      }

      const [r] = await db.insert(reviews).values({
        centerId: input.centerId,
        studentId: ctx.user.id,
        rating: input.rating,
        text: input.text ?? null,
      });
      return { id: r.insertId };
    }),

  canReview: authedQuery
    .input(z.object({ centerId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.role !== "student" || !ctx.user.centerId || ctx.user.centerId !== input.centerId) {
        return { canReview: false, reason: "not_eligible" };
      }

      const [existing] = await db
        .select()
        .from(reviews)
        .where(and(eq(reviews.studentId, ctx.user.id), eq(reviews.centerId, input.centerId)));
      if (existing) return { canReview: false, reason: "already_reviewed" };

      const [attempt] = await db
        .select({ count: count() })
        .from(quizAttempts)
        .innerJoin(lessons, eq(quizAttempts.lessonId, lessons.id))
        .where(and(
          eq(quizAttempts.studentId, ctx.user.id),
          eq(lessons.centerId, input.centerId),
        ));

      if (attempt.count === 0) return { canReview: false, reason: "no_lessons_completed" };

      return { canReview: true };
    }),
});
