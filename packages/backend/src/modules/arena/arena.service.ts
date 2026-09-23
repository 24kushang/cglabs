import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, desc, and, ne, sql } from 'drizzle-orm';
import { ideas, showdownMatches, showdownVotes, showdownBattles } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import type {
  ArenaMatchDto,
  ArenaNominateDto,
  ArenaStartMatchDto,
  ArenaConcludeResultDto,
  ArenaLeaderboardEntryDto,
  IdeaDto,
} from '@cglabs/shared';
import { EXP_REWARDS } from '@cglabs/shared';
import { IdeasService } from '../ideas/ideas.service.js';
import { ExpService } from '../users/exp.service.js';

@Injectable()
export class ArenaService {
  /**
   * Nominate an idea into the arena queue.
   * If there are at least 2 nominated ideas and no active match, automatically initialize the active match.
   */
  static async nominateIdea(d1: D1Database, userId: string, ideaId: string) {
    if (!userId || !ideaId) {
      throw new BadRequestException('User ID and Idea ID are required.');
    }

    const db = getDb(d1);
    const idea = await db.query.ideas.findFirst({ where: eq(ideas.id, ideaId) });

    if (!idea) {
      throw new BadRequestException('Idea not found.');
    }
    if (idea.authorId !== userId) {
      throw new BadRequestException('You can only nominate ideas that you authored.');
    }

    // Set idea as in arena
    await db
      .update(ideas)
      .set({ isInArena: true })
      .where(eq(ideas.id, ideaId));

    // Check if an active match already exists
    const activeMatch = await db.query.showdownMatches.findFirst({
      where: eq(showdownMatches.status, 'active'),
    });

    if (!activeMatch) {
      // Check if we have at least 2 nominated ideas
      const nominated = await db.select().from(ideas).where(eq(ideas.isInArena, true));
      if (nominated.length >= 2) {
        // Pick 2 distinct ideas to start a match
        const ideaA = nominated[0];
        const ideaB = nominated.find((i) => i.id !== ideaA.id) || nominated[1];
        await ArenaService.startMatch(d1, ideaA.id, ideaB.id);
      }
    }

    return {
      success: true,
      ideaId,
      message: `"${idea.title}" has entered the Arena!`,
    };
  }

  /**
   * Get all ideas currently nominated / in the arena queue.
   */
  static async getNominatedIdeas(d1: D1Database): Promise<IdeaDto[]> {
    const db = getDb(d1);
    const nominated = await db.select().from(ideas).where(eq(ideas.isInArena, true));

    const result: IdeaDto[] = [];
    for (const raw of nominated) {
      const formatted = await IdeasService.formatIdea(d1, raw);
      result.push(formatted);
    }
    return result;
  }

  /**
   * Start a new active match between ideaA and ideaB.
   */
  static async startMatch(d1: D1Database, ideaAId: string, ideaBId: string) {
    if (!ideaAId || !ideaBId || ideaAId === ideaBId) {
      throw new BadRequestException('Two distinct idea IDs are required to start a showdown.');
    }

    const db = getDb(d1);

    // Conclude any existing active matches
    const existingActive = await db.select().from(showdownMatches).where(eq(showdownMatches.status, 'active'));
    const nowIso = new Date().toISOString();

    for (const old of existingActive) {
      await db
        .update(showdownMatches)
        .set({ status: 'concluded', concludedAt: nowIso })
        .where(eq(showdownMatches.id, old.id));
    }

    const newMatchId = crypto.randomUUID();
    await db.insert(showdownMatches).values({
      id: newMatchId,
      ideaAId,
      ideaBId,
      status: 'active',
      createdAt: nowIso,
    });

    // Ensure both ideas are marked in arena
    await db.update(ideas).set({ isInArena: true }).where(eq(ideas.id, ideaAId));
    await db.update(ideas).set({ isInArena: true }).where(eq(ideas.id, ideaBId));

    return newMatchId;
  }

  /**
   * Get the active showdown match with live audience vote tallies and contender checks.
   */
  static async getActiveMatch(d1: D1Database, currentUserId?: string): Promise<ArenaMatchDto | null> {
    const db = getDb(d1);

    let match = await db.query.showdownMatches.findFirst({
      where: eq(showdownMatches.status, 'active'),
      orderBy: [desc(showdownMatches.createdAt)],
    });

    // If no active match, check if we can auto-start one from nominated ideas
    if (!match) {
      const nominated = await db.select().from(ideas).where(eq(ideas.isInArena, true));
      if (nominated.length >= 2) {
        const id = await ArenaService.startMatch(d1, nominated[0].id, nominated[1].id);
        match = await db.query.showdownMatches.findFirst({ where: eq(showdownMatches.id, id) });
      }
    }

    // If still no match and there are at least 2 total ideas in the system, auto-seed the first active match
    if (!match) {
      const allIdeas = await db.select().from(ideas);
      if (allIdeas.length >= 2) {
        const id = await ArenaService.startMatch(d1, allIdeas[0].id, allIdeas[1].id);
        match = await db.query.showdownMatches.findFirst({ where: eq(showdownMatches.id, id) });
      }
    }

    if (!match) {
      return null;
    }

    const rawIdeaA = await db.query.ideas.findFirst({ where: eq(ideas.id, match.ideaAId) });
    const rawIdeaB = await db.query.ideas.findFirst({ where: eq(ideas.id, match.ideaBId) });

    if (!rawIdeaA || !rawIdeaB) {
      return null;
    }

    const ideaA = await IdeasService.formatIdea(d1, rawIdeaA, currentUserId);
    const ideaB = await IdeasService.formatIdea(d1, rawIdeaB, currentUserId);

    // Fetch all audience votes cast for this match
    const votes = await db
      .select()
      .from(showdownVotes)
      .where(eq(showdownVotes.matchId, match.id));

    const votesA = votes.filter((v) => v.votedIdeaId === match.ideaAId).length;
    const votesB = votes.filter((v) => v.votedIdeaId === match.ideaBId).length;
    const totalVotes = votesA + votesB;

    let percentA = 50;
    let percentB = 50;
    if (totalVotes > 0) {
      percentA = Math.round((votesA / totalVotes) * 100);
      percentB = 100 - percentA;
    }

    // Check contender restrictions (author of A or B cannot vote)
    const userIsAuthorA = currentUserId ? currentUserId === rawIdeaA.authorId : false;
    const userIsAuthorB = currentUserId ? currentUserId === rawIdeaB.authorId : false;
    const isContender = userIsAuthorA || userIsAuthorB;

    // Check if current user has already cast a vote
    let hasVoted = false;
    let userVotedIdeaId: string | null = null;

    if (currentUserId) {
      const myVote = votes.find((v) => v.voterUserId === currentUserId);
      if (myVote) {
        hasVoted = true;
        userVotedIdeaId = myVote.votedIdeaId;
      }
    }

    return {
      id: match.id,
      ideaA,
      ideaB,
      status: match.status as 'active' | 'concluded',
      winnerIdeaId: match.winnerIdeaId || null,
      votesA,
      votesB,
      totalVotes,
      percentA,
      percentB,
      hasVoted,
      userVotedIdeaId,
      isContender,
      userIsAuthorA,
      userIsAuthorB,
      createdAt: match.createdAt,
      concludedAt: match.concludedAt || null,
    };
  }

  /**
   * Audience voting action.
   * STRICT RULE: The authors of Idea A and Idea B cannot vote in their own battle!
   */
  static async recordAudienceVote(
    d1: D1Database,
    voterUserId: string,
    matchId: string,
    votedIdeaId: string
  ): Promise<ArenaMatchDto> {
    if (!voterUserId) {
      throw new BadRequestException('You must be signed in to cast an audience vote.');
    }
    if (!matchId || !votedIdeaId) {
      throw new BadRequestException('Match ID and voted Idea ID are required.');
    }

    const db = getDb(d1);
    const match = await db.query.showdownMatches.findFirst({
      where: and(eq(showdownMatches.id, matchId), eq(showdownMatches.status, 'active')),
    });

    if (!match) {
      throw new BadRequestException('Showdown match is not currently active.');
    }

    if (votedIdeaId !== match.ideaAId && votedIdeaId !== match.ideaBId) {
      throw new BadRequestException('Invalid vote: Idea is not competing in this match.');
    }

    const rawIdeaA = await db.query.ideas.findFirst({ where: eq(ideas.id, match.ideaAId) });
    const rawIdeaB = await db.query.ideas.findFirst({ where: eq(ideas.id, match.ideaBId) });

    if (!rawIdeaA || !rawIdeaB) {
      throw new BadRequestException('Match ideas could not be verified.');
    }

    // CONTENDER RULE: Authors cannot vote in their own battle!
    if (voterUserId === rawIdeaA.authorId || voterUserId === rawIdeaB.authorId) {
      throw new BadRequestException(
        'Contenders cannot vote in their own showdown battle! Present your pitch while the audience votes.'
      );
    }

    // Check duplicate vote
    const existingVote = await db.query.showdownVotes.findFirst({
      where: and(
        eq(showdownVotes.matchId, matchId),
        eq(showdownVotes.voterUserId, voterUserId)
      ),
    });

    if (existingVote) {
      throw new BadRequestException('You have already cast your vote in this showdown match.');
    }

    // Insert audience vote
    const nowIso = new Date().toISOString();
    await db.insert(showdownVotes).values({
      id: crypto.randomUUID(),
      matchId,
      voterUserId,
      votedIdeaId,
      createdAt: nowIso,
    });

    // Award +5 EXP to the audience voter for participating in judging
    await ExpService.awardExp(d1, voterUserId, EXP_REWARDS.SHOWDOWN_VOTE_CAST, 'Audience Showdown Vote');

    const updated = await ArenaService.getActiveMatch(d1, voterUserId);
    if (!updated) {
      throw new BadRequestException('Failed to retrieve updated match details.');
    }
    return updated;
  }

  /**
   * Conclude the active match based on audience votes, declare the winner, and award EXP.
   */
  static async concludeMatch(d1: D1Database, matchId: string): Promise<ArenaConcludeResultDto> {
    const db = getDb(d1);
    const match = await db.query.showdownMatches.findFirst({
      where: eq(showdownMatches.id, matchId),
    });

    if (!match) {
      throw new BadRequestException('Showdown match not found.');
    }

    const votes = await db
      .select()
      .from(showdownVotes)
      .where(eq(showdownVotes.matchId, matchId));

    const votesA = votes.filter((v) => v.votedIdeaId === match.ideaAId).length;
    const votesB = votes.filter((v) => v.votedIdeaId === match.ideaBId).length;

    let winnerId: string | null = null;
    let loserId: string | null = null;
    let isDraw = false;

    if (votesA > votesB) {
      winnerId = match.ideaAId;
      loserId = match.ideaBId;
    } else if (votesB > votesA) {
      winnerId = match.ideaBId;
      loserId = match.ideaAId;
    } else {
      // Tie
      winnerId = match.ideaAId;
      loserId = match.ideaBId;
      isDraw = true;
    }

    const nowIso = new Date().toISOString();

    // Mark match concluded
    await db
      .update(showdownMatches)
      .set({
        status: 'concluded',
        winnerIdeaId: winnerId,
        concludedAt: nowIso,
      })
      .where(eq(showdownMatches.id, matchId));

    // Update win/loss records
    let winnerIdea: any = null;
    if (winnerId) {
      winnerIdea = await db.query.ideas.findFirst({ where: eq(ideas.id, winnerId) });
      if (winnerIdea) {
        await db
          .update(ideas)
          .set({
            battleWins: Number(winnerIdea.battleWins || 0) + 1,
            isInArena: false,
          })
          .where(eq(ideas.id, winnerId));

        // Award +25 EXP to the winning author
        if (winnerIdea.authorId) {
          await ExpService.awardExp(d1, winnerIdea.authorId, 25, 'Showdown Arena Champion');
        }
      }
    }

    if (loserId) {
      const loserIdea = await db.query.ideas.findFirst({ where: eq(ideas.id, loserId) });
      if (loserIdea) {
        await db
          .update(ideas)
          .set({
            battleLosses: Number(loserIdea.battleLosses || 0) + 1,
            isInArena: false,
          })
          .where(eq(ideas.id, loserId));
      }
    }

    // Log to historical showdownBattles
    if (winnerId && loserId) {
      await db.insert(showdownBattles).values({
        id: crypto.randomUUID(),
        winnerIdeaId: winnerId,
        loserIdeaId: loserId,
        voterUserId: 'audience_consensus',
        createdAt: nowIso,
      });
    }

    return {
      success: true,
      matchId,
      winnerIdeaId: winnerId,
      winnerTitle: winnerIdea?.title || 'Unknown Winner',
      winnerVotes: Math.max(votesA, votesB),
      loserVotes: Math.min(votesA, votesB),
      isDraw,
      authorExpEarned: 25,
    };
  }

  /**
   * Arena Champions Leaderboard.
   */
  static async getLeaderboard(d1: D1Database, limit: number = 25): Promise<ArenaLeaderboardEntryDto[]> {
    const db = getDb(d1);
    const allIdeas = await db.select().from(ideas);

    const scored = allIdeas.map((idea) => {
      const wins = Number(idea.battleWins || 0);
      const losses = Number(idea.battleLosses || 0);
      const total = wins + losses;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return {
        rawIdea: idea,
        wins,
        losses,
        total,
        winRate,
      };
    });

    const filtered = scored.some((s) => s.total > 0) ? scored.filter((s) => s.total > 0) : scored;

    filtered.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.total - a.total;
    });

    const top = filtered.slice(0, limit);

    const leaderboard: ArenaLeaderboardEntryDto[] = [];
    for (let i = 0; i < top.length; i++) {
      const item = top[i];
      const formatted = await IdeasService.formatIdea(d1, item.rawIdea);
      leaderboard.push({
        idea: formatted,
        battleWins: item.wins,
        battleLosses: item.losses,
        totalBattles: item.total,
        winRate: item.winRate,
        rank: i + 1,
      });
    }

    return leaderboard;
  }

  // Instance wrappers
  async nominateIdea(d1: D1Database, userId: string, ideaId: string) {
    return ArenaService.nominateIdea(d1, userId, ideaId);
  }

  async getNominatedIdeas(d1: D1Database) {
    return ArenaService.getNominatedIdeas(d1);
  }

  async startMatch(d1: D1Database, ideaAId: string, ideaBId: string) {
    return ArenaService.startMatch(d1, ideaAId, ideaBId);
  }

  async getActiveMatch(d1: D1Database, currentUserId?: string) {
    return ArenaService.getActiveMatch(d1, currentUserId);
  }

  async recordAudienceVote(d1: D1Database, voterUserId: string, matchId: string, votedIdeaId: string) {
    return ArenaService.recordAudienceVote(d1, voterUserId, matchId, votedIdeaId);
  }

  async concludeMatch(d1: D1Database, matchId: string) {
    return ArenaService.concludeMatch(d1, matchId);
  }

  async getLeaderboard(d1: D1Database, limit?: number) {
    return ArenaService.getLeaderboard(d1, limit);
  }
}
