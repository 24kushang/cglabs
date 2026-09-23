import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  isTemporary: integer('is_temporary', { mode: 'boolean' }).notNull().default(false),
  expiresAt: integer('expires_at').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const userPreferences = sqliteTable('user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  themePresetId: text('theme_preset_id').notNull().default('cyberpunk'),
  primaryColor: text('primary_color').notNull().default('#00f3ff'),
  secondaryColor: text('secondary_color').notNull().default('#ff0055'),
  mode: text('mode').notNull().default('dark'),
  fontFamily: text('font_family').notNull().default('Inter'),
  borderRadius: integer('border_radius').notNull().default(8),
  density: text('density').notNull().default('comfortable'),
  pokemon: text('pokemon').notNull().default('pikachu'),
  mascotQuote: text('mascot_quote').notNull().default('Always finding slick workarounds.'),
  customizedAt: text('customized_at').notNull(),
  isConfigured: integer('is_configured', { mode: 'boolean' }).notNull().default(false),
  exp: integer('exp').notNull().default(0),
  level: integer('level').notNull().default(1),
});

export const ideas = sqliteTable('ideas', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  shortDescription: text('short_description').notNull(), // Max 280 chars
  pitchMarkdown: text('pitch_markdown').notNull(),        // Markdown full proposal
  tags: text('tags').notNull().default('[]'),              // JSON array string
  battleWins: integer('battle_wins').notNull().default(0),
  battleLosses: integer('battle_losses').notNull().default(0),
  isInArena: integer('is_in_arena', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  coolnessScore: integer('coolness_score').notNull(),      // 1 to 10 rating
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userIdeaVoteIdx: uniqueIndex('user_idea_vote_idx').on(table.ideaId, table.userId),
}));

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  ideaId: text('idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const showdownBattles = sqliteTable('showdown_battles', {
  id: text('id').primaryKey(),
  winnerIdeaId: text('winner_idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  loserIdeaId: text('loser_idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  voterUserId: text('voter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
});

export const showdownMatches = sqliteTable('showdown_matches', {
  id: text('id').primaryKey(),
  ideaAId: text('idea_a_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  ideaBId: text('idea_b_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('active'), // 'active' | 'concluded'
  winnerIdeaId: text('winner_idea_id').references(() => ideas.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
  concludedAt: text('concluded_at'),
});

export const showdownVotes = sqliteTable('showdown_votes', {
  id: text('id').primaryKey(),
  matchId: text('match_id').notNull().references(() => showdownMatches.id, { onDelete: 'cascade' }),
  voterUserId: text('voter_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  votedIdeaId: text('voted_idea_id').notNull().references(() => ideas.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  matchUserVoteIdx: uniqueIndex('match_user_vote_idx').on(table.matchId, table.voterUserId),
}));
