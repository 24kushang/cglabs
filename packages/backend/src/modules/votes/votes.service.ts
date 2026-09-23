import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { votes, ideas } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import { EXP_REWARDS } from '@cglabs/shared';
import { UsersService } from '../users/users.service.js';
import { ExpService } from '../users/exp.service.js';

@Injectable()
export class VotesService {
  async castVote(dbBinding: D1Database, ideaId: string, userId: string, coolnessScore: number) {
    if (coolnessScore < 1 || coolnessScore > 10) {
      throw new BadRequestException('Coolness rating must be an integer between 1 and 10.');
    }

    // Ensure user record exists statically in users table for FK constraint
    await UsersService.ensureUserExists(dbBinding, userId);

    const db = getDb(dbBinding);
    const existing = await db.query.votes.findFirst({
      where: and(eq(votes.ideaId, ideaId), eq(votes.userId, userId)),
    });

    const nowIso = new Date().toISOString();

    if (existing) {
      await db
        .update(votes)
        .set({ coolnessScore, createdAt: nowIso })
        .where(eq(votes.id, existing.id));
    } else {
      await db.insert(votes).values({
        id: crypto.randomUUID(),
        ideaId,
        userId,
        coolnessScore,
        createdAt: nowIso,
      });

      // Award EXP for casting a vote (first time only)
      await ExpService.awardExp(dbBinding, userId, EXP_REWARDS.VOTE_CAST, 'Cast Coolness Vote');

      // Award EXP to the idea author for receiving a community vote
      const targetIdea = await db.query.ideas.findFirst({ where: eq(ideas.id, ideaId) });
      if (targetIdea && targetIdea.authorId && targetIdea.authorId !== userId) {
        await ExpService.awardExp(dbBinding, targetIdea.authorId, EXP_REWARDS.VOTE_RECEIVED, 'Received Idea Vote');
      }
    }

    const ideaVotes = await db.select().from(votes).where(eq(votes.ideaId, ideaId));
    const totalVotes = ideaVotes.length;
    const totalScore = ideaVotes.reduce((acc, curr) => acc + curr.coolnessScore, 0);
    const averageCoolness = totalVotes > 0 ? Number((totalScore / totalVotes).toFixed(1)) : 0;

    return {
      ideaId,
      coolnessScore,
      averageCoolness,
      totalVotes,
    };
  }
}
