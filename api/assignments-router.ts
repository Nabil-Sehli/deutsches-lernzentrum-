import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { assignments, submissions, users, quizAttempts, lessons } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createNotification } from "./lib/notifications";

export const assignmentsRouter = createRouter({
  listByCenter: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return [];
    return db
      .select()
      .from(assignments)
      .where(eq(assignments.centerId, ctx.user.centerId))
      .orderBy(desc(assignments.createdAt));
  }),

  myAssignments: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) return [];

    const all = await db
      .select()
      .from(assignments)
      .where(eq(assignments.centerId, ctx.user.centerId))
      .orderBy(desc(assignments.createdAt));

    const mySubmissions = await db
      .select()
      .from(submissions)
      .where(eq(submissions.studentId, ctx.user.id));

    return all.map((a) => ({
      ...a,
      submission: mySubmissions.find((s) => s.assignmentId === a.id) ?? null,
    }));
  }),

  create: authedQuery
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      lessonId: z.number().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

      const [a] = await db.insert(assignments).values({
        centerId: ctx.user.centerId,
        title: input.title,
        description: input.description ?? null,
        lessonId: input.lessonId ?? null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      });

      const students = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.centerId, ctx.user.centerId), eq(users.role, "student")));

      await Promise.all(students.map(s =>
        createNotification(s.id, "assignment_posted", "New assignment", `"${input.title}" has been posted`, "/dashboard")
      ));

      return { id: a.insertId };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [a] = await db.select().from(assignments).where(eq(assignments.id, input.id));
      if (!a || a.centerId !== ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND" });
      await db.delete(assignments).where(eq(assignments.id, input.id));
      return { success: true };
    }),

  submit: authedQuery
    .input(z.object({
      assignmentId: z.number(),
      text: z.string().optional(),
      fileUrl: z.string().optional(),
    }).refine(d => d.text || d.fileUrl, { message: "Either text or fileUrl is required" }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You are not part of a center" });

      const [existing] = await db
        .select()
        .from(submissions)
        .where(and(
          eq(submissions.assignmentId, input.assignmentId),
          eq(submissions.studentId, ctx.user.id)
        ));
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Already submitted" });

      await db.insert(submissions).values({
        assignmentId: input.assignmentId,
        studentId: ctx.user.id,
        text: input.text ?? null,
        fileUrl: input.fileUrl ?? null,
      });
      return { success: true };
    }),

  grade: authedQuery
    .input(z.object({
      id: z.number(),
      grade: z.number().min(0).max(100),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [sub] = await db.select().from(submissions).where(eq(submissions.id, input.id));
      if (!sub) throw new TRPCError({ code: "NOT_FOUND" });

      await db.update(submissions).set({
        grade: input.grade,
        feedback: input.feedback ?? null,
        gradedBy: ctx.user.id,
        gradedAt: new Date(),
      }).where(eq(submissions.id, input.id));

      await createNotification(
        sub.studentId,
        "grade_ready",
        "Grade ready",
        `Your assignment has been graded: ${input.grade}/100`,
        "/dashboard"
      );

      return { success: true };
    }),

  listSubmissions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

    return db
      .select({
        id: submissions.id,
        assignmentId: submissions.assignmentId,
        studentId: submissions.studentId,
        text: submissions.text,
        fileUrl: submissions.fileUrl,
        grade: submissions.grade,
        feedback: submissions.feedback,
        submittedAt: submissions.submittedAt,
        gradedAt: submissions.gradedAt,
        studentName: users.name,
        studentTitle: users.title,
        assignmentTitle: assignments.title,
      })
      .from(submissions)
      .innerJoin(users, eq(submissions.studentId, users.id))
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(eq(assignments.centerId, ctx.user.centerId))
      .orderBy(desc(submissions.submittedAt));
  }),

  // ── Student Progress ──

  progress: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user.centerId) throw new TRPCError({ code: "NOT_FOUND", message: "You do not manage a center" });

    const students = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        title: users.title,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.centerId, ctx.user.centerId), eq(users.role, "student")))
      .orderBy(users.name);

    const centerLessons = await db
      .select({ id: lessons.id, title: lessons.title })
      .from(lessons)
      .where(eq(lessons.centerId, ctx.user.centerId));

    const allAttempts = await db
      .select()
      .from(quizAttempts)
      .innerJoin(users, eq(quizAttempts.studentId, users.id))
      .where(eq(users.centerId, ctx.user.centerId));

    const allSubmissions = await db
      .select()
      .from(submissions)
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(eq(assignments.centerId, ctx.user.centerId));

    return students.map((s) => {
      const sAttempts = allAttempts.filter((a) => a.quiz_attempts.studentId === s.id);
      const sSubmissions = allSubmissions.filter((sub) => sub.submissions.studentId === s.id);
      const totalQuizScore = sAttempts.reduce((sum, a) => sum + (a.quiz_attempts.score / a.quiz_attempts.totalQuestions) * 100, 0);
      const avgQuizScore = sAttempts.length > 0 ? Math.round(totalQuizScore / sAttempts.length) : null;
      const lessonsCompleted = new Set(sAttempts.map((a) => a.quiz_attempts.lessonId)).size;
      const gradedSubmissions = sSubmissions.filter((s) => s.submissions.grade != null);
      const avgAssignmentGrade = gradedSubmissions.length > 0
        ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.submissions.grade!, 0) / gradedSubmissions.length)
        : null;

      return {
        student: s,
        quizAttempts: sAttempts.length,
        avgQuizScore,
        lessonsCompleted,
        totalLessons: centerLessons.length,
        submissions: sSubmissions.length,
        gradedSubmissions: gradedSubmissions.length,
        avgAssignmentGrade,
      };
    });
  }),
});
