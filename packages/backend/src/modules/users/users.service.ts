import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users, userPreferences } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';

@Injectable()
export class UsersService {
  static async ensureUserExists(dbBinding: D1Database, userId: string, displayName?: string) {
    const db = getDb(dbBinding);
    const existing = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (existing) {
      const prefs = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });
      return { user: existing, preferences: prefs ?? null };
    }

    const now = Date.now();
    const expiresAt = now + 86400000; // 24h
    const newDisplayName = displayName || `Explorer #${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAtIso = new Date(now).toISOString();

    await db.insert(users).values({
      id: userId,
      displayName: newDisplayName,
      isTemporary: true,
      expiresAt,
      createdAt: createdAtIso,
    });

    const initialPrefs = {
      id: crypto.randomUUID(),
      userId,
      themePresetId: 'cyberpunk',
      primaryColor: '#00f3ff',
      secondaryColor: '#ff0055',
      mode: 'dark',
      fontFamily: 'Inter',
      borderRadius: 8,
      density: 'comfortable',
      spiritAnimal: 'fox',
      mascotQuote: 'Always finding slick workarounds.',
      customizedAt: createdAtIso,
      isConfigured: false,
    };

    try {
      await db.insert(userPreferences).values(initialPrefs);
    } catch (e) {}

    return {
      user: {
        id: userId,
        displayName: newDisplayName,
        isTemporary: true,
        expiresAt,
        createdAt: createdAtIso,
      },
      preferences: initialPrefs,
    };
  }

  async ensureUserExists(dbBinding: D1Database, userId: string, displayName?: string) {
    return UsersService.ensureUserExists(dbBinding, userId, displayName);
  }

  async getOrCreateTempUser(dbBinding: D1Database, userId: string, displayName?: string) {
    return UsersService.ensureUserExists(dbBinding, userId, displayName);
  }
}
