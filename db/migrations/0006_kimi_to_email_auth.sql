ALTER TABLE `users` DROP COLUMN `unionId`;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) DEFAULT '';--> statement-breakpoint
UPDATE `users` SET `passwordHash` = '' WHERE `passwordHash` IS NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordHash` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('student','teacher') NOT NULL DEFAULT 'student';--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `title` enum('Mr','Mrs');--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `sex` enum('male','female');--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `age` int;--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `city` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `bio` text;
