import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  json,
  bigint,
  index,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["student", "teacher", "admin"]).default("student").notNull(),
  title: mysqlEnum("title", ["Mr", "Mrs"]),
  sex: mysqlEnum("sex", ["male", "female"]),
  age: int("age"),
  city: varchar("city", { length: 255 }),
  level: mysqlEnum("level", ["a1", "a2", "b1", "b2", "c1", "c2"]),
  levelRequestedAt: timestamp("levelRequestedAt"),
  bio: text("bio"),
  avatar: text("avatar"),
  centerId: bigint("centerId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  centerIdIdx: index("users_centerId_idx").on(table.centerId),
  roleIdx: index("users_role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const emailVerificationCodes = mysqlTable("email_verification_codes", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("evc_userId_idx").on(table.userId),
}));

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;

export const centers = mysqlTable("centers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logo: varchar("logo", { length: 512 }),
  banner: varchar("banner", { length: 512 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  emails: json("emails").$type<{ email: string }[]>(),
  locations: json("locations").$type<{ country: string; city: string; address: string }[]>(),
  phones: json("phones").$type<{ countryCode: string; number: string }[]>(),
  albumImages: json("albumImages").$type<string[]>(),
  themeColor: varchar("themeColor", { length: 7 }).default("#e8f5e9"),
  plan: mysqlEnum("plan", ["free", "premium"]).default("free").notNull(),
  videoUploadCount: int("videoUploadCount").default(0).notNull(),
  videoUploadWeek: int("videoUploadWeek"),
  assignmentCount: int("assignmentCount").default(0).notNull(),
  assignmentCountWeek: int("assignmentCountWeek"),
  adminId: bigint("adminId", { mode: "number", unsigned: true }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }),
  // Billing fields
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  nextBillingDate: timestamp("nextBillingDate"),
  billingEmail: varchar("billingEmail", { length: 320 }),
  planStartDate: timestamp("planStartDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => ({
  adminIdIdx: index("centers_adminId_idx").on(table.adminId),
  stripeCustomerIdIdx: index("centers_stripeCustomerId_idx").on(table.stripeCustomerId),
}));

export type Center = typeof centers.$inferSelect;
export type InsertCenter = typeof centers.$inferInsert;

export const inviteCodes = mysqlTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  usedBy: bigint("usedBy", { mode: "number", unsigned: true }),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("invite_codes_centerId_idx").on(table.centerId),
  usedByIdx: index("invite_codes_usedBy_idx").on(table.usedBy),
}));

export type InviteCode = typeof inviteCodes.$inferSelect;
export type InsertInviteCode = typeof inviteCodes.$inferInsert;

export const lessons = mysqlTable("lessons", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 512 }).notNull(),
  level: mysqlEnum("level", ["a1", "a2", "b1", "b2", "c1", "c2"]),
  groupId: bigint("groupId", { mode: "number", unsigned: true }),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => ({
  centerIdIdx: index("lessons_centerId_idx").on(table.centerId),
  centerOrderIdx: index("lessons_centerId_order_idx").on(table.centerId, table.order),
}));

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

export const questions = mysqlTable("questions", {
  id: serial("id").primaryKey(),
  lessonId: bigint("lessonId", { mode: "number", unsigned: true }).notNull(),
  text: text("text").notNull(),
  options: json("options").$type<string[]>().notNull(),
  correctAnswerIndex: int("correctAnswerIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  lessonIdIdx: index("questions_lessonId_idx").on(table.lessonId),
}));

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

export const quizAttempts = mysqlTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lessonId", { mode: "number", unsigned: true }).notNull(),
  score: int("score").notNull(),
  totalQuestions: int("totalQuestions").notNull(),
  answers: json("answers").$type<number[]>().notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
}, (table) => ({
  studentIdIdx: index("quiz_attempts_studentId_idx").on(table.studentId),
  lessonIdIdx: index("quiz_attempts_lessonId_idx").on(table.lessonId),
  studentLessonIdx: index("quiz_attempts_studentId_lessonId_idx").on(table.studentId, table.lessonId),
}));

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

export const centerRequests = mysqlTable("center_requests", {
  id: serial("id").primaryKey(),
  teacherId: bigint("teacherId", { mode: "number", unsigned: true }).notNull(),
  centerName: varchar("centerName", { length: 255 }).notNull(),
  centerBio: text("centerBio"),
  logo: varchar("logo", { length: 512 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  reviewedBy: bigint("reviewedBy", { mode: "number", unsigned: true }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => ({
  teacherIdIdx: index("cr_teacherId_idx").on(table.teacherId),
  statusIdx: index("cr_status_idx").on(table.status),
}));

export type CenterRequest = typeof centerRequests.$inferSelect;
export type InsertCenterRequest = typeof centerRequests.$inferInsert;

export const centerRequestEmails = mysqlTable("center_request_emails", {
  id: serial("id").primaryKey(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
}, (table) => ({
  requestIdIdx: index("cre_requestId_idx").on(table.requestId),
}));

export type CenterRequestEmail = typeof centerRequestEmails.$inferSelect;
export type InsertCenterRequestEmail = typeof centerRequestEmails.$inferInsert;

export const centerRequestLocations = mysqlTable("center_request_locations", {
  id: serial("id").primaryKey(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }).notNull(),
  country: varchar("country", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  address: text("address").notNull(),
}, (table) => ({
  requestIdIdx: index("crl_requestId_idx").on(table.requestId),
}));

export type CenterRequestLocation = typeof centerRequestLocations.$inferSelect;
export type InsertCenterRequestLocation = typeof centerRequestLocations.$inferInsert;

export const centerRequestPhones = mysqlTable("center_request_phones", {
  id: serial("id").primaryKey(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }).notNull(),
  countryCode: varchar("countryCode", { length: 10 }).notNull(),
  number: varchar("number", { length: 50 }).notNull(),
}, (table) => ({
  requestIdIdx: index("crp_requestId_idx").on(table.requestId),
}));

export type CenterRequestPhone = typeof centerRequestPhones.$inferSelect;
export type InsertCenterRequestPhone = typeof centerRequestPhones.$inferInsert;

export const centerRequestAlbums = mysqlTable("center_request_albums", {
  id: serial("id").primaryKey(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }).notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
}, (table) => ({
  requestIdIdx: index("cra_requestId_idx").on(table.requestId),
}));

export type CenterRequestAlbum = typeof centerRequestAlbums.$inferSelect;
export type InsertCenterRequestAlbum = typeof centerRequestAlbums.$inferInsert;

export const centerRequestDocuments = mysqlTable("center_request_documents", {
  id: serial("id").primaryKey(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }).notNull(),
  documentUrl: varchar("documentUrl", { length: 512 }).notNull(),
  documentType: varchar("documentType", { length: 100 }),
}, (table) => ({
  requestIdIdx: index("crd_requestId_idx").on(table.requestId),
}));

export type CenterRequestDocument = typeof centerRequestDocuments.$inferSelect;
export type InsertCenterRequestDocument = typeof centerRequestDocuments.$inferInsert;

// API Keys table
export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("api_keys_centerId_idx").on(table.centerId),
}));

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// Webhooks table
export const webhooks = mysqlTable("webhooks", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  events: json("events").$type<string[]>().notNull(), // ['student.enrolled', 'lesson.completed']
  active: boolean("active").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  lastFailureAt: timestamp("lastFailureAt"),
  failureCount: int("failureCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("webhooks_centerId_idx").on(table.centerId),
}));

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

// Webhook delivery logs
export const webhookLogs = mysqlTable("webhook_logs", {
  id: serial("id").primaryKey(),
  webhookId: bigint("webhookId", { mode: "number", unsigned: true }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  statusCode: int("statusCode"),
  response: text("response"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  webhookIdIdx: index("webhook_logs_webhookId_idx").on(table.webhookId),
  eventTypeIdx: index("webhook_logs_eventType_idx").on(table.eventType),
}));

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

export const uploads = mysqlTable("uploads", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  fileName: varchar("fileName", { length: 512 }).notNull(),
  fileSize: int("fileSize").notNull(),
  contentType: varchar("contentType", { length: 100 }).notNull(),
  category: mysqlEnum("category", ["image", "video", "document", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("uploads_centerId_idx").on(table.centerId),
}));

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

export const meetingRooms = mysqlTable("meeting_rooms", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 512 }).notNull(),
  scheduledAt: timestamp("scheduledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("meeting_rooms_centerId_idx").on(table.centerId),
}));

export type MeetingRoom = typeof meetingRooms.$inferSelect;
export type InsertMeetingRoom = typeof meetingRooms.$inferInsert;

export const meetingRoomMessages = mysqlTable("meeting_room_messages", {
  id: serial("id").primaryKey(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  message: text("message").notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  reactions: json("reactions").default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  roomIdIdx: index("meeting_room_messages_roomId_idx").on(table.roomId),
}));

export type MeetingRoomMessage = typeof meetingRoomMessages.$inferSelect;
export type InsertMeetingRoomMessage = typeof meetingRoomMessages.$inferInsert;

export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  message: text("message").notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  level: mysqlEnum("level", ["a1", "a2", "b1", "b2", "c1", "c2"]),
  reactions: json("reactions").default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("chat_messages_centerId_idx").on(table.centerId),
}));

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export const assignments = mysqlTable("assignments", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lessonId", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  level: mysqlEnum("level", ["a1", "a2", "b1", "b2", "c1", "c2"]),
  groupId: bigint("groupId", { mode: "number", unsigned: true }),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("assignments_centerId_idx").on(table.centerId),
  lessonIdIdx: index("assignments_lessonId_idx").on(table.lessonId),
}));

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = typeof assignments.$inferInsert;

export const submissions = mysqlTable("submissions", {
  id: serial("id").primaryKey(),
  assignmentId: bigint("assignmentId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  fileUrl: text("fileUrl"),
  text: text("text"),
  grade: int("grade"),
  feedback: text("feedback"),
  gradedBy: bigint("gradedBy", { mode: "number", unsigned: true }),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  gradedAt: timestamp("gradedAt"),
}, (table) => ({
  assignmentIdIdx: index("submissions_assignmentId_idx").on(table.assignmentId),
  studentIdIdx: index("submissions_studentId_idx").on(table.studentId),
  assignmentStudentIdx: index("submissions_assignmentStudent_idx").on(table.assignmentId, table.studentId),
}));

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", ["new_message", "upcoming_meeting", "grade_ready", "assignment_posted", "level_needed", "level_reminder", "lesson_published", "quiz_graded", "level_changed", "assignment_due_soon"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  link: varchar("link", { length: 512 }),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notifications_userId_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.read, table.userId),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const groups = mysqlTable("groups", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  level: mysqlEnum("level", ["a1", "a2", "b1", "b2", "c1", "c2"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("groups_centerId_idx").on(table.centerId),
}));

export type Group = typeof groups.$inferSelect;
export type InsertGroup = typeof groups.$inferInsert;

export const groupMembers = mysqlTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: bigint("groupId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  groupIdIdx: index("group_members_groupId_idx").on(table.groupId),
  studentIdIdx: index("group_members_studentId_idx").on(table.studentId),
  groupStudentIdx: index("group_members_groupStudent_idx").on(table.groupId, table.studentId),
}));

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

export const calendarEvents = mysqlTable("calendar_events", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  type: mysqlEnum("type", ["lesson", "meeting", "assignment_due", "custom"]).notNull(),
  level: mysqlEnum("level", ["a1", "a2", "b1", "b2", "c1", "c2"]),
  createdById: bigint("createdById", { mode: "number", unsigned: true }).notNull(),
  meetingRoomId: bigint("meetingRoomId", { mode: "number", unsigned: true }),
  assignmentId: bigint("assignmentId", { mode: "number", unsigned: true }),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("calendar_events_centerId_idx").on(table.centerId),
  startTimeIdx: index("calendar_events_startTime_idx").on(table.startTime),
}));

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

export const reviews = mysqlTable("reviews", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  rating: int("rating").notNull(),
  text: text("text"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("reviews_centerId_idx").on(table.centerId),
  studentIdIdx: index("reviews_studentId_idx").on(table.studentId),
}));

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const vocabularyWords = mysqlTable("vocabulary_words", {
  id: serial("id").primaryKey(),
  centerId: bigint("centerId", { mode: "number", unsigned: true }).notNull(),
  lessonId: bigint("lessonId", { mode: "number", unsigned: true }),
  word: varchar("word", { length: 255 }).notNull(),
  translation: varchar("translation", { length: 255 }).notNull(),
  example: text("example"),
  partOfSpeech: varchar("partOfSpeech", { length: 50 }),
  level: mysqlEnum("level", ["a1", "a2", "b1", "b2", "c1", "c2"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  centerIdIdx: index("vocab_centerId_idx").on(table.centerId),
  lessonIdIdx: index("vocab_lessonId_idx").on(table.lessonId),
  levelIdx: index("vocab_level_idx").on(table.level),
}));

export type VocabularyWord = typeof vocabularyWords.$inferSelect;
export type InsertVocabularyWord = typeof vocabularyWords.$inferInsert;

export const wordReviews = mysqlTable("word_reviews", {
  id: serial("id").primaryKey(),
  wordId: bigint("wordId", { mode: "number", unsigned: true }).notNull(),
  studentId: bigint("studentId", { mode: "number", unsigned: true }).notNull(),
  ease: bigint("ease", { mode: "number" }).default(250).notNull(),
  interval: bigint("interval", { mode: "number" }).default(0).notNull(),
  repetitions: bigint("repetitions", { mode: "number" }).default(0).notNull(),
  nextReviewAt: timestamp("nextReviewAt").notNull(),
  lastReviewAt: timestamp("lastReviewAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  wordIdIdx: index("word_reviews_wordId_idx").on(table.wordId),
  studentIdIdx: index("word_reviews_studentId_idx").on(table.studentId),
  wordStudentIdx: index("word_reviews_wordStudent_idx").on(table.wordId, table.studentId),
}));

export type WordReview = typeof wordReviews.$inferSelect;
export type InsertWordReview = typeof wordReviews.$inferInsert;

export const achievements = mysqlTable("achievements", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 10 }),
  requirementType: varchar("requirementType", { length: 50 }).notNull(),
  requirementCount: int("requirementCount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export const userAchievements = mysqlTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  achievementId: bigint("achievementId", { mode: "number", unsigned: true }).notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_achievements_userId_idx").on(table.userId),
  achievementIdIdx: index("user_achievements_achievementId_idx").on(table.achievementId),
  userAchievementIdx: index("user_achievements_userAchievement_idx").on(table.userId, table.achievementId),
}));

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
