import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { questions, lessons, centers } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const questionRouter = createRouter({
  listByLesson: authedQuery
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(questions)
        .where(eq(questions.lessonId, input.lessonId));
    }),

  create: authedQuery
    .input(
      z.object({
        lessonId: z.number(),
        text: z.string().min(1),
        options: z.array(z.string()).min(2).max(6),
        correctAnswerIndex: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, input.lessonId));
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });

      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.adminId, ctx.user.id));
      if (!center || center.id !== lesson.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      if (input.correctAnswerIndex >= input.options.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Correct answer index is out of range" });
      }

      const [question] = await db.insert(questions).values({
        lessonId: input.lessonId,
        text: input.text,
        options: input.options,
        correctAnswerIndex: input.correctAnswerIndex,
      });
      return question;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        text: z.string().min(1).optional(),
        options: z.array(z.string()).min(2).max(6).optional(),
        correctAnswerIndex: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, input.id));
      if (!question) throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });

      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, question.lessonId));
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });

      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.adminId, ctx.user.id));
      if (!center || center.id !== lesson.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await db
        .update(questions)
        .set({
          text: input.text ?? question.text,
          options: input.options ?? question.options,
          correctAnswerIndex:
            input.correctAnswerIndex ?? question.correctAnswerIndex,
        })
        .where(eq(questions.id, input.id));
      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [question] = await db
        .select()
        .from(questions)
        .where(eq(questions.id, input.id));
      if (!question) throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });

      const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.id, question.lessonId));
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });

      const [center] = await db
        .select()
        .from(centers)
        .where(eq(centers.adminId, ctx.user.id));
      if (!center || center.id !== lesson.centerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await db.delete(questions).where(eq(questions.id, input.id));
      return { success: true };
    }),
});
