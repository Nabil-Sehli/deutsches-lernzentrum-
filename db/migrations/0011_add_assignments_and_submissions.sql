CREATE TABLE `assignments` (
  `id` serial NOT NULL AUTO_INCREMENT,
  `centerId` bigint unsigned NOT NULL,
  `lessonId` bigint unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `dueDate` timestamp DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assignments_centerId_idx` (`centerId`),
  KEY `assignments_lessonId_idx` (`lessonId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `submissions` (
  `id` serial NOT NULL AUTO_INCREMENT,
  `assignmentId` bigint unsigned NOT NULL,
  `studentId` bigint unsigned NOT NULL,
  `fileUrl` text DEFAULT NULL,
  `text` text DEFAULT NULL,
  `grade` int DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `gradedBy` bigint unsigned DEFAULT NULL,
  `submittedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gradedAt` timestamp DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `submissions_assignmentId_idx` (`assignmentId`),
  KEY `submissions_studentId_idx` (`studentId`),
  KEY `submissions_assignmentStudent_idx` (`assignmentId`, `studentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
