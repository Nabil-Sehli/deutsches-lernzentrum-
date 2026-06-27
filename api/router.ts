import { authRouter } from "./auth-router";
import { centerRouter } from "./center-router";
import { lessonRouter } from "./lesson-router";
import { questionRouter } from "./question-router";
import { quizRouter } from "./quiz-router";
import { inviteRouter } from "./invite-router";
import { uploadRouter } from "./upload-router";
import { centerRequestRouter } from "./center-request-router";
import { billingRouter } from "./billing-router";
import { apiKeysRouter } from "./apikeys-router";
import { webhooksRouter } from "./webhooks-router";
import { meetingRoomsRouter } from "./meeting-rooms-router";
import { chatRouter } from "./chat-router";
import { assignmentsRouter } from "./assignments-router";
import { notificationsRouter } from "./notifications-router";
import { groupsRouter } from "./groups-router";
import { calendarRouter } from "./calendar-router";
import { reviewsRouter } from "./reviews-router";
import { vocabularyRouter } from "./vocabulary-router";
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
  billing: billingRouter,
  apiKeys: apiKeysRouter,
  webhooks: webhooksRouter,
  meetingRooms: meetingRoomsRouter,
  chat: chatRouter,
  assignments: assignmentsRouter,
  notifications: notificationsRouter,
  groups: groupsRouter,
  calendar: calendarRouter,
  reviews: reviewsRouter,
  vocabulary: vocabularyRouter,
});

export type AppRouter = typeof appRouter;
