CREATE INDEX `centers_adminId_idx` ON `centers` (`adminId`);--> statement-breakpoint
CREATE INDEX `invite_codes_centerId_idx` ON `invite_codes` (`centerId`);--> statement-breakpoint
CREATE INDEX `invite_codes_usedBy_idx` ON `invite_codes` (`usedBy`);--> statement-breakpoint
CREATE INDEX `lessons_centerId_idx` ON `lessons` (`centerId`);--> statement-breakpoint
CREATE INDEX `lessons_centerId_order_idx` ON `lessons` (`centerId`,`order`);--> statement-breakpoint
CREATE INDEX `questions_lessonId_idx` ON `questions` (`lessonId`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_studentId_idx` ON `quiz_attempts` (`studentId`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_lessonId_idx` ON `quiz_attempts` (`lessonId`);--> statement-breakpoint
CREATE INDEX `quiz_attempts_studentId_lessonId_idx` ON `quiz_attempts` (`studentId`,`lessonId`);--> statement-breakpoint
CREATE INDEX `users_centerId_idx` ON `users` (`centerId`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);