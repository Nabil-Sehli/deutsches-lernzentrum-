ALTER TABLE `notifications`
  MODIFY COLUMN `type` ENUM('new_message', 'upcoming_meeting', 'grade_ready', 'assignment_posted', 'level_needed', 'level_reminder', 'lesson_published', 'quiz_graded', 'level_changed', 'assignment_due_soon') NOT NULL;

CREATE TABLE `groups` (
  `id` SERIAL PRIMARY KEY,
  `centerId` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `level` ENUM('a1','a2','b1','b2','c1','c2'),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `groups_centerId_idx` (`centerId`)
);

CREATE TABLE `group_members` (
  `id` SERIAL PRIMARY KEY,
  `groupId` BIGINT UNSIGNED NOT NULL,
  `studentId` BIGINT UNSIGNED NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `group_members_groupId_idx` (`groupId`),
  INDEX `group_members_studentId_idx` (`studentId`),
  UNIQUE INDEX `group_members_groupStudent_idx` (`groupId`, `studentId`)
);

CREATE TABLE `calendar_events` (
  `id` SERIAL PRIMARY KEY,
  `centerId` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `startTime` TIMESTAMP NOT NULL,
  `endTime` TIMESTAMP,
  `type` ENUM('lesson','meeting','assignment_due','custom') NOT NULL,
  `level` ENUM('a1','a2','b1','b2','c1','c2'),
  `createdById` BIGINT UNSIGNED NOT NULL,
  `meetingRoomId` BIGINT UNSIGNED,
  `assignmentId` BIGINT UNSIGNED,
  `color` VARCHAR(7),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `calendar_events_centerId_idx` (`centerId`),
  INDEX `calendar_events_startTime_idx` (`startTime`)
);

CREATE TABLE `reviews` (
  `id` SERIAL PRIMARY KEY,
  `centerId` BIGINT UNSIGNED NOT NULL,
  `studentId` BIGINT UNSIGNED NOT NULL,
  `rating` INT NOT NULL,
  `text` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `reviews_centerId_idx` (`centerId`),
  INDEX `reviews_studentId_idx` (`studentId`)
);

ALTER TABLE `lessons`
  ADD COLUMN `groupId` BIGINT UNSIGNED AFTER `level`;

ALTER TABLE `assignments`
  ADD COLUMN `groupId` BIGINT UNSIGNED AFTER `level`;
