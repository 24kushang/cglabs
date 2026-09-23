-- Migration: Add exp and level to user_preferences
ALTER TABLE user_preferences ADD COLUMN exp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_preferences ADD COLUMN level INTEGER NOT NULL DEFAULT 1;
