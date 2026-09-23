-- Migration: Add showdown_matches, showdown_votes and is_in_arena column to ideas
ALTER TABLE ideas ADD COLUMN is_in_arena INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS showdown_matches (
  id TEXT PRIMARY KEY,
  idea_a_id TEXT NOT NULL,
  idea_b_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  winner_idea_id TEXT,
  created_at TEXT NOT NULL,
  concluded_at TEXT
);

CREATE TABLE IF NOT EXISTS showdown_votes (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  voter_user_id TEXT NOT NULL,
  voted_idea_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(match_id, voter_user_id)
);
