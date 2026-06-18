CREATE TABLE `notifications` (
  `id` serial NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `type` enum('new_message','upcoming_meeting','grade_ready','assignment_posted') NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text DEFAULT NULL,
  `link` varchar(512) DEFAULT NULL,
  `read` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_userId_idx` (`userId`),
  KEY `notifications_read_idx` (`read`, `userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
