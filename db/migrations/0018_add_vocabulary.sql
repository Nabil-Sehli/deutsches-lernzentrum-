CREATE TABLE `vocabulary_words` (
  `id` SERIAL PRIMARY KEY,
  `centerId` BIGINT UNSIGNED NOT NULL,
  `lessonId` BIGINT UNSIGNED,
  `word` VARCHAR(255) NOT NULL,
  `translation` VARCHAR(255) NOT NULL,
  `example` TEXT,
  `partOfSpeech` VARCHAR(50),
  `level` ENUM('a1','a2','b1','b2','c1','c2') NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `vocab_centerId_idx` (`centerId`),
  INDEX `vocab_lessonId_idx` (`lessonId`),
  INDEX `vocab_level_idx` (`level`)
);

CREATE TABLE `word_reviews` (
  `id` SERIAL PRIMARY KEY,
  `wordId` BIGINT UNSIGNED NOT NULL,
  `studentId` BIGINT UNSIGNED NOT NULL,
  `ease` BIGINT NOT NULL DEFAULT 250,
  `interval` BIGINT NOT NULL DEFAULT 0,
  `repetitions` BIGINT NOT NULL DEFAULT 0,
  `nextReviewAt` TIMESTAMP NOT NULL,
  `lastReviewAt` TIMESTAMP,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `word_reviews_wordId_idx` (`wordId`),
  INDEX `word_reviews_studentId_idx` (`studentId`),
  UNIQUE INDEX `word_reviews_wordStudent_idx` (`wordId`, `studentId`)
);
