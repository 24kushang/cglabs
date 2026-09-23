import { Injectable, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users, userPreferences } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';

@Injectable()
export class UsersService {
  static async ensureUserExists(dbBinding: D1Database, userId: string, displayName?: string) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required. Please log in or register.');
    }

    const db = getDb(dbBinding);
    const existing = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existing) {
      throw new UnauthorizedException('User not found. Please log in or register.');
    }

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    return { user: existing, preferences: prefs ?? null };
  }

  async ensureUserExists(dbBinding: D1Database, userId: string, displayName?: string) {
    return UsersService.ensureUserExists(dbBinding, userId, displayName);
  }

  async getOrCreateTempUser(dbBinding: D1Database, userId: string, displayName?: string) {
    return UsersService.ensureUserExists(dbBinding, userId, displayName);
  }
}
