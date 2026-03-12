-- Migration: revert health_profiles to plain columns, keep contact_phone as encrypted TEXT
-- Run against glucogu_db
-- WARNING: clears existing (encrypted) data — users will re-enter their profile.

DELETE FROM health_profiles;

ALTER TABLE health_profiles
  MODIFY COLUMN date_of_birth DATE DEFAULT NULL,
  MODIFY COLUMN gender ENUM('male','female','other') DEFAULT NULL,
  MODIFY COLUMN height_cm FLOAT DEFAULT NULL,
  MODIFY COLUMN weight_kg FLOAT DEFAULT NULL,
  MODIFY COLUMN bmi FLOAT DEFAULT NULL,
  MODIFY COLUMN smoking_status ENUM('non-smoker','former','current') DEFAULT NULL;
