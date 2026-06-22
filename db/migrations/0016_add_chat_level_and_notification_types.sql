ALTER TABLE chat_messages ADD COLUMN level ENUM('a1','a2','b1','b2','c1','c2') NULL AFTER imageUrl;

ALTER TABLE notifications MODIFY COLUMN type ENUM('new_message','upcoming_meeting','grade_ready','assignment_posted','level_needed','level_reminder') NOT NULL;

ALTER TABLE users ADD COLUMN levelRequestedAt timestamp NULL AFTER level;
