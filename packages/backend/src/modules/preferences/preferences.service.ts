import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, ne, and } from 'drizzle-orm';
import { userPreferences, users } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import type { UserPreferencesDto, ClaimedPokemonDto } from '@cglabs/shared';

@Injectable()
export class PreferencesService {
  async getUserPreferences(dbBinding: D1Database, userId: string) {
    const db = getDb(dbBinding);
    return await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });
  }

  async getClaimedPokemons(dbBinding: D1Database): Promise<ClaimedPokemonDto[]> {
    const db = getDb(dbBinding);
    const allPrefs = await db
      .select({
        pokemon: userPreferences.pokemon,
        userId: userPreferences.userId,
        username: users.username,
        displayName: users.displayName,
      })
      .from(userPreferences)
      .leftJoin(users, eq(userPreferences.userId, users.id))
      .where(eq(userPreferences.isConfigured, true));

    return allPrefs.map((p) => ({
      pokemon: p.pokemon as any,
      userId: p.userId,
      username: p.username || p.displayName || 'Creator',
    }));
  }

  async saveUserPreferences(dbBinding: D1Database, userId: string, dto: UserPreferencesDto) {
    const db = getDb(dbBinding);
    const requestedPokemon = dto.pokemon || 'pikachu';

    // Verify if requested Pokemon is already claimed by another user
    const claimedByOther = await db.query.userPreferences.findFirst({
      where: and(
        eq(userPreferences.pokemon, requestedPokemon),
        ne(userPreferences.userId, userId),
        eq(userPreferences.isConfigured, true)
      ),
    });

    if (claimedByOther) {
      const otherUser = await db.query.users.findFirst({
        where: eq(users.id, claimedByOther.userId),
      });
      const claimedName = otherUser?.username || 'another creator';
      throw new BadRequestException(
        `The Pokémon partner '${requestedPokemon}' has already been claimed by @${claimedName}. Please select a different Pokémon!`
      );
    }

    const existing = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    const nowIso = new Date().toISOString();
    const updatedData = {
      themePresetId: dto.themePresetId || 'cyberpunk',
      primaryColor: dto.primaryColor || '#eab308',
      secondaryColor: dto.secondaryColor || '#eab308',
      mode: dto.mode || 'dark',
      fontFamily: dto.fontFamily || 'Inter',
      borderRadius: dto.borderRadius || 10,
      density: dto.density || 'comfortable',
      pokemon: requestedPokemon,
      mascotQuote: dto.mascotQuote || 'Innovating at full speed.',
      customizedAt: nowIso,
      isConfigured: true,
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

