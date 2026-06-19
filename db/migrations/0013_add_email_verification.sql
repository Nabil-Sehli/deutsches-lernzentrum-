ALTER TABLE `users` ADD COLUMN `emailVerified` boolean NOT NULL DEFAULT false;

CREATE TABLE `email_verification_codes` (
  `id` serial NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `code` varchar(6) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evc_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
