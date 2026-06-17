import { z } from "zod";
import { createRouter, publicQuery, authedQuery, checkVideoUploadLimit, incrementVideoUploadCount } from "./middleware";
import { getDb } from "./queries/connection";
import { lessons, questions, quizAttempts } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const lessonRouter = createRouter({
  listByCenter: publicQuery
    .input(z.object({ centerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(lessons)
        .where(eq(lessons.centerId, input.centerId))
        .orderBy(lessons.order);
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.id));
      if (!lesson) return null;
      const lessonQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.lessonId, input.id));
      return { ...lesson, questions: lessonQuestions };
    }),

  myLessons: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return [];
    return db
      .select()
      .from(lessons)
      .where(eq(lessons.centerId, ctx.user.centerId))
      .orderBy(lessons.order);
  }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        videoUrl: z.string().min(1).max(512),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      await checkVideoUploadLimit(ctx.user.centerId);

      try {
        const [lesson] = await db.insert(lessons).values({
          centerId: ctx.user.centerId,
          title: input.title,
          description: input.description ?? "",
          videoUrl: input.videoUrl,
          order: input.order,
        });
        return lesson;
      } finally {
        await incrementVideoUploadCount(ctx.user.centerId);
      }
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        videoUrl: z.string().min(1).max(512).optional(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.id));
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });

      if (ctx.user.centerId !== lesson.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to edit this lesson" });
      }

      await db
        .update(lessons)
        .set({
          title: input.title ?? lesson.title,
          description: input.description ?? lesson.description,
          videoUrl: input.videoUrl ?? lesson.videoUrl,
          order: input.order ?? lesson.order,
        })
        .where(eq(lessons.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.id));
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });

      if (ctx.user.centerId !== lesson.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this lesson" });
      }

      await db.delete(questions).where(eq(questions.lessonId, input.id));
      await db.delete(quizAttempts).where(eq(quizAttempts.lessonId, input.id));
      await db.delete(lessons).where(eq(lessons.id, input.id));
      return { success: true };
    }),
});
