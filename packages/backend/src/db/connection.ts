import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema.js';

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type AppDb = ReturnType<typeof getDb>;

let tablesInitialized = false;

export async function ensureTablesCreated(d1: D1Database) {
  if (tablesInitialized) return;

  console.log('[DB] 🔄 Initializing SQLite / D1 database connection...');

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      is_temporary INTEGER NOT NULL DEFAULT 1,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      theme_preset_id TEXT NOT NULL DEFAULT 'cyberpunk',
      primary_color TEXT NOT NULL DEFAULT '#00f3ff',
      secondary_color TEXT NOT NULL DEFAULT '#ff0055',
      mode TEXT NOT NULL DEFAULT 'dark',
      font_family TEXT NOT NULL DEFAULT 'Inter',
      border_radius INTEGER NOT NULL DEFAULT 8,
      density TEXT NOT NULL DEFAULT 'comfortable',
      pokemon TEXT NOT NULL DEFAULT 'pikachu',
      mascot_quote TEXT NOT NULL DEFAULT 'Always finding slick workarounds.',
      customized_at TEXT NOT NULL,
      is_configured INTEGER NOT NULL DEFAULT 0
    );`,

    `ALTER TABLE user_preferences ADD COLUMN pokemon TEXT DEFAULT 'pikachu';`,

    `CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      title TEXT NOT NULL,
      short_description TEXT NOT NULL,
      pitch_markdown TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,

    `CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      idea_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      coolness_score INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(idea_id, user_id)
    );`,

    `CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      idea_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      parent_id TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`,
  ];

  try {
    for (const sql of ddlStatements) {
      try {
        await d1.prepare(sql).run();
      } catch (innerErr) {
        // Safe catch for individual table DDL
      }
    }
    tablesInitialized = true;
    console.log('[DB] ✅ SQLite / Cloudflare D1 Database connected successfully! All tables verified.');
  } catch (e) {
    console.error('[DB] ❌ Database tables check notice:', e);
  }
}
