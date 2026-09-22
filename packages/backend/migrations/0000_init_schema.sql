-- Migration 0000: Initialize full schema for Cloudflare D1
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  is_temporary INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  theme_preset_id TEXT NOT NULL DEFAULT 'cyberpunk',
  primary_color TEXT NOT NULL DEFAULT '#eab308',
  secondary_color TEXT NOT NULL DEFAULT '#eab308',
  mode TEXT NOT NULL DEFAULT 'dark',
  font_family TEXT NOT NULL DEFAULT 'Inter',
  border_radius INTEGER NOT NULL DEFAULT 10,
  density TEXT NOT NULL DEFAULT 'comfortable',
  pokemon TEXT NOT NULL DEFAULT 'pikachu',
  mascot_quote TEXT NOT NULL DEFAULT 'Always finding slick workarounds.',
  customized_at TEXT NOT NULL,
  is_configured INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ideas (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  pitch_markdown TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coolness_score INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(idea_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id TEXT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
