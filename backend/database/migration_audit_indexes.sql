-- Migration: Enhanced audit logging and security tables
-- Run once against glucogu_db

-- Add index on system_logs for faster queries by action_type
CREATE INDEX IF NOT EXISTS idx_system_logs_action_type ON system_logs (action_type);

-- Add index on system_logs for created_at ordering
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs (created_at DESC);

-- Add composite index for user activity queries
CREATE INDEX IF NOT EXISTS idx_system_logs_user_created ON system_logs (user_id, created_at DESC);
