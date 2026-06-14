import { relations } from "drizzle-orm";
import {
  users, centers, inviteCodes, lessons, questions, quizAttempts,
  centerRequests, centerRequestEmails, centerRequestLocations,
  centerRequestPhones, centerRequestAlbums, centerRequestDocuments,
} from "./schema";

export const usersRelations = relations(users, ({ one }) => ({
  center: one(centers, {
    fields: [users.centerId],
    references: [centers.id],
  }),
}));

export const centersRelations = relations(centers, ({ many, one }) => ({
  admin: one(users, {
    fields: [centers.adminId],
    references: [users.id],
  }),
  lessons: many(lessons),
  inviteCodes: many(inviteCodes),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  center: one(centers, {
    fields: [lessons.centerId],
    references: [centers.id],
  }),
  questions: many(questions),
  quizAttempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [questions.lessonId],
    references: [lessons.id],
  }),
}));

export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
  center: one(centers, {
    fields: [inviteCodes.centerId],
    references: [centers.id],
  }),
  usedByUser: one(users, {
    fields: [inviteCodes.usedBy],
    references: [users.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  student: one(users, {
    fields: [quizAttempts.studentId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [quizAttempts.lessonId],
    references: [lessons.id],
  }),
}));

export const centerRequestsRelations = relations(centerRequests, ({ many, one }) => ({
  teacher: one(users, {
    fields: [centerRequests.teacherId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [centerRequests.reviewedBy],
    references: [users.id],
  }),
  emails: many(centerRequestEmails),
  locations: many(centerRequestLocations),
  phones: many(centerRequestPhones),
  albums: many(centerRequestAlbums),
  documents: many(centerRequestDocuments),
}));

export const centerRequestEmailsRelations = relations(centerRequestEmails, ({ one }) => ({
  request: one(centerRequests, {
    fields: [centerRequestEmails.requestId],
    references: [centerRequests.id],
  }),
}));

export const centerRequestLocationsRelations = relations(centerRequestLocations, ({ one }) => ({
  request: one(centerRequests, {
    fields: [centerRequestLocations.requestId],
    references: [centerRequests.id],
  }),
}));

export const centerRequestPhonesRelations = relations(centerRequestPhones, ({ one }) => ({
  request: one(centerRequests, {
    fields: [centerRequestPhones.requestId],
    references: [centerRequests.id],
  }),
}));

export const centerRequestAlbumsRelations = relations(centerRequestAlbums, ({ one }) => ({
  request: one(centerRequests, {
    fields: [centerRequestAlbums.requestId],
    references: [centerRequests.id],
  }),
}));

export const centerRequestDocumentsRelations = relations(centerRequestDocuments, ({ one }) => ({
  request: one(centerRequests, {
    fields: [centerRequestDocuments.requestId],
    references: [centerRequests.id],
  }),
}));
