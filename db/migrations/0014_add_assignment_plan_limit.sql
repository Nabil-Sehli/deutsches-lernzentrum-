ALTER TABLE centers
  ADD COLUMN assignmentCount INT DEFAULT 0 NOT NULL,
  ADD COLUMN assignmentCountWeek INT;
