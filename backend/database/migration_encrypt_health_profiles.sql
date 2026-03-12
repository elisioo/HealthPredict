-- Migration: encrypt health profile fields + add contact_phone
-- Run against glucogu_db AFTER setting ENCRYPTION_KEY in backend/.env
--
-- WARNING: This clears existing plain-text health profile data.
-- Users will need to re-enter their health profile so values are saved encrypted.

DELETE FROM health_profiles;

ALTER TABLE health_profiles
  MODIFY COLUMN date_of_birth TEXT DEFAULT NULL COMMENT 'AES-256-GCM encrypted',
  MODIFY COLUMN gender TEXT DEFAULT NULL COMMENT 'AES-256-GCM encrypted',
  MODIFY COLUMN height_cm TEXT DEFAULT NULL COMMENT 'AES-256-GCM encrypted',
  MODIFY COLUMN weight_kg TEXT DEFAULT NULL COMMENT 'AES-256-GCM encrypted',
  MODIFY COLUMN bmi TEXT DEFAULT NULL COMMENT 'AES-256-GCM encrypted',
  MODIFY COLUMN smoking_status TEXT DEFAULT NULL COMMENT 'AES-256-GCM encrypted',
  ADD COLUMN contact_phone TEXT DEFAULT NULL COMMENT 'AES-256-GCM encrypted contact phone number';
