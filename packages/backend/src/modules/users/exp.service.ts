import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { userPreferences } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import { calculateLevel, getEvolutionStage } from '@cglabs/shared';
import type { PokemonId } from '@cglabs/shared';

@Injectable()
export class ExpService {
  static async awardExp(
    d1: D1Database,
    userId: string,
    amount: number,
    reason: string = 'contribution'
  ) {
    if (!userId || amount <= 0) return null;

    const db = getDb(d1);
    const pref = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });

    if (!pref) return null;

    const oldExp = pref.exp || 0;
    const oldLevel = pref.level || 1;
    const newExp = oldExp + amount;
    const { level: newLevel } = calculateLevel(newExp);

    const oldStage = getEvolutionStage(pref.pokemon as PokemonId, oldLevel);
    const newStage = getEvolutionStage(pref.pokemon as PokemonId, newLevel);
    const evolved = oldStage.currentStage.stage !== newStage.currentStage.stage;

    await db
      .update(userPreferences)
      .set({
        exp: newExp,
        level: newLevel,
      })
      .where(eq(userPreferences.userId, userId));

    console.log(
      `[EXP] ✨ User ${userId} earned +${amount} EXP for ${reason}. (Total: ${newExp}, Lv. ${newLevel})${
        evolved ? ` 🌟 EVOLVED into ${newStage.currentStage.name}!` : ''
      }`
    );

    return {
      userId,
      oldExp,
      newExp,
      oldLevel,
      newLevel,
      amount,
      evolved,
      stage: newStage.currentStage,
    };
  }

  async awardExp(
    d1: D1Database,
    userId: string,
    amount: number,
    reason: string = 'contribution'
  ) {
    return ExpService.awardExp(d1, userId, amount, reason);
  }
}
