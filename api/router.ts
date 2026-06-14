import { authRouter } from "./auth-router";
import { centerRouter } from "./center-router";
import { lessonRouter } from "./lesson-router";
import { questionRouter } from "./question-router";
import { quizRouter } from "./quiz-router";
import { inviteRouter } from "./invite-router";
import { uploadRouter } from "./upload-router";
import { centerRequestRouter } from "./center-request-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  center: centerRouter,
  lesson: lessonRouter,
  question: questionRouter,
  quiz: quizRouter,
  invite: inviteRouter,
  upload: uploadRouter,
  centerRequest: centerRequestRouter,
});

export type AppRouter = typeof appRouter;
