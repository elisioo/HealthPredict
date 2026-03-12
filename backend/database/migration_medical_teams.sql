-- Migration: create medical_teams and team_members tables
-- Run against glucogu_db

CREATE TABLE IF NOT EXISTS medical_teams (
  team_id      INT AUTO_INCREMENT PRIMARY KEY,
  team_name    VARCHAR(120) NOT NULL,
  description  TEXT DEFAULT NULL,
  created_by   INT NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_team_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS team_members (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  team_id      INT NOT NULL,
  user_id      INT NOT NULL,
  added_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_team_user (team_id, user_id),
  CONSTRAINT fk_tm_team FOREIGN KEY (team_id) REFERENCES medical_teams(team_id) ON DELETE CASCADE,
  CONSTRAINT fk_tm_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
