-- Migration: Add showdown_battles table and battle_wins/battle_losses to ideas
CREATE TABLE IF NOT EXISTS showdown_battles (
  id TEXT PRIMARY KEY,
  winner_idea_id TEXT NOT NULL,
  loser_idea_id TEXT NOT NULL,
  voter_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

ALTER TABLE ideas ADD COLUMN battle_wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE ideas ADD COLUMN battle_losses INTEGER NOT NULL DEFAULT 0;
