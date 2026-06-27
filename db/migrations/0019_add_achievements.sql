CREATE TABLE `achievements` (
  `id` SERIAL PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `icon` VARCHAR(10),
  `requirementType` VARCHAR(50) NOT NULL,
  `requirementCount` INT NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `user_achievements` (
  `id` SERIAL PRIMARY KEY,
  `userId` BIGINT UNSIGNED NOT NULL,
  `achievementId` BIGINT UNSIGNED NOT NULL,
  `unlockedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `user_achievements_userId_idx` (`userId`),
  INDEX `user_achievements_achievementId_idx` (`achievementId`),
  UNIQUE INDEX `user_achievements_userAchievement_idx` (`userId`, `achievementId`)
);

-- Seed achievement definitions
INSERT INTO `achievements` (`key`, `name`, `description`, `icon`, `requirementType`, `requirementCount`) VALUES
('first_quiz', 'First Steps', 'Complete your first quiz', '🎯', 'quiz_completed', 1),
('quiz_5', 'Quiz Enthusiast', 'Complete 5 quizzes', '📝', 'quiz_completed', 5),
('quiz_10', 'Quiz Master', 'Complete 10 quizzes', '🏆', 'quiz_completed', 10),
('perfect_quiz', 'Perfect Score', 'Get 100% on a quiz', '💯', 'perfect_quiz', 1),
('lessons_5', 'Eager Learner', 'Complete 5 lessons', '📚', 'lesson_completed', 5),
('lessons_10', 'Dedicated Student', 'Complete 10 lessons', '🎓', 'lesson_completed', 10),
('lessons_25', 'Knowledge Seeker', 'Complete 25 lessons', '🌟', 'lesson_completed', 25),
('vocab_50', 'Word Collector', 'Review 50 vocabulary words', '🔤', 'vocab_reviewed', 50),
('vocab_100', 'Vocabulary Star', 'Review 100 vocabulary words', '⭐', 'vocab_reviewed', 100),
('vocab_master_10', 'Word Master', 'Master 10 words (5+ repetitions)', '🏅', 'vocab_mastered', 10),
('assignments_5', 'Homework Hero', 'Submit 5 assignments', '📋', 'assignment_submitted', 5),
('level_reached', 'First Level', 'Get your first CEFR level assigned', '🚀', 'level_assigned', 1);
