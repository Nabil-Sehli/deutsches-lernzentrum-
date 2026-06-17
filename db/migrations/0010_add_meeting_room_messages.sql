CREATE TABLE `meeting_room_messages` (
  `id` serial NOT NULL AUTO_INCREMENT,
  `roomId` bigint unsigned NOT NULL,
  `userId` bigint unsigned NOT NULL,
  `message` text NOT NULL,
  `imageUrl` varchar(1024) DEFAULT NULL,
  `reactions` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `meeting_room_messages_roomId_idx` (`roomId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
