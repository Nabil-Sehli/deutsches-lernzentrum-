ALTER TABLE users
  ADD COLUMN level ENUM('a1','a2','b1','b2','c1','c2');

ALTER TABLE lessons
  ADD COLUMN level ENUM('a1','a2','b1','b2','c1','c2');

ALTER TABLE assignments
  ADD COLUMN level ENUM('a1','a2','b1','b2','c1','c2');
