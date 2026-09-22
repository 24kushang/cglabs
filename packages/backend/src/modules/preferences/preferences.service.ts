import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { userPreferences } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import type { UserPreferencesDto } from '@cglabs/shared';

@Injectable()
export class PreferencesService {
  async getUserPreferences(dbBinding: D1Database, userId: string) {
    const db = getDb(dbBinding);
    return await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });
  }

  async saveUserPreferences(dbBinding: D1Database, userId: string, dto: UserPreferencesDto) {
    const db = getDb(dbBinding);
    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    const nowIso = new Date().toISOString();
    const updatedData = {
      themePresetId: dto.themePresetId,
      primaryColor: dto.primaryColor,
      secondaryColor: dto.secondaryColor,
      mode: dto.mode,
      fontFamily: dto.fontFamily,
      borderRadius: dto.borderRadius,
      density: dto.density,
      pokemon: dto.pokemon || 'pikachu',
      mascotQuote: dto.mascotQuote || 'Innovating at full speed.',
      customizedAt: nowIso,
      isConfigured: true, // Personalization complete!
    };

    if (existing) {
      await db
        .update(userPreferences)
        .set(updatedData)
        .where(eq(userPreferences.userId, userId));
    } else {
      await db.insert(userPreferences).values({
        id: crypto.randomUUID(),
        userId,
        ...updatedData,
      });
    }

    return await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });
  }
}
