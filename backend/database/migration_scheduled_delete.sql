-- Add scheduled_delete_at column to users table
-- This column tracks when a user should be permanently deleted (1 min after admin schedules it)
ALTER TABLE `users` ADD COLUMN `scheduled_delete_at` DATETIME DEFAULT NULL AFTER `is_active`;
