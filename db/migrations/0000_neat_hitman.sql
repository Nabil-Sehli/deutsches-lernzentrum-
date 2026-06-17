CREATE TABLE `centers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`adminId` bigint unsigned NOT NULL,
	`slug` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `centers_id` PRIMARY KEY(`id`),
	CONSTRAINT `centers_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `invite_codes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`centerId` bigint unsigned NOT NULL,
	`usedBy` bigint unsigned,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invite_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `invite_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`centerId` bigint unsigned NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` varchar(512) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`lessonId` bigint unsigned NOT NULL,
	`text` text NOT NULL,
	`options` json NOT NULL,
	`correctAnswerIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`studentId` bigint unsigned NOT NULL,
	`lessonId` bigint unsigned NOT NULL,
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`answers` json NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`unionId` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`avatar` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`centerId` bigint unsigned,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`lastSignInAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_unionId_unique` UNIQUE(`unionId`)
);
