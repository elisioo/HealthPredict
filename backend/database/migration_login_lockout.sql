-- Migration: add login attempt tracking & account lockout
-- Run once against glucogu_db

ALTER TABLE users
  ADD COLUMN login_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0
    COMMENT 'Consecutive failed login attempts' AFTER is_active,
  ADD COLUMN locked_until DATETIME DEFAULT NULL
    COMMENT 'Account locked until this UTC timestamp (NULL = not locked)' AFTER login_attempts;

-- Index: admin queries for locked accounts
CREATE INDEX idx_users_locked_until ON users (locked_until);
