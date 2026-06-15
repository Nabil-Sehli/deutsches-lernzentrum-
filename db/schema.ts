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
  bio: text("bio"),
  avatar: text("avatar"),
  centerId: bigint("centerId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  centerIdIdx: index("users_centerId_idx").on(table.centerId),
  roleIdx: index("users_role_idx").on(table.role),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
  adminId: bigint("adminId", { mode: "number", unsigned: true }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  requestId: bigint("requestId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}, (table) => ({
  adminIdIdx: index("centers_adminId_idx").on(table.adminId),
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
