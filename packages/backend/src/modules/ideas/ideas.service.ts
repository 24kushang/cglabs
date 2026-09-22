import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, desc, like, lt, sql } from 'drizzle-orm';
import { ideas, users, userPreferences, votes } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import type { CreateIdeaDto, ArchiveMonthDto } from '@cglabs/shared';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class IdeasService {
  async createIdea(dbBinding: D1Database, authorId: string, rawInput: any) {
    const dto: CreateIdeaDto = rawInput?.idea || rawInput || {};

    const trimmedDesc = dto.shortDescription ? String(dto.shortDescription).trim() : '';
    const charCount = [...trimmedDesc].length;

    if (!trimmedDesc || charCount > 280) {
      throw new BadRequestException(`Short description is required and must not exceed 280 characters.`);
    }
    if (!dto.title || !dto.pitchMarkdown) {
      throw new BadRequestException('Title and pitch proposal markdown are required.');
    }

    // Ensure user record exists statically in users table for FK constraint
    await UsersService.ensureUserExists(dbBinding, authorId);

    const db = getDb(dbBinding);
    const id = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    await db.insert(ideas).values({
      id,
      authorId,
      title: String(dto.title).trim(),
      shortDescription: trimmedDesc,
      pitchMarkdown: String(dto.pitchMarkdown).trim(),
      tags: JSON.stringify(dto.tags || []),
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    return this.getIdeaById(dbBinding, id, authorId);
  }

  async getAllIdeas(dbBinding: D1Database, currentUserId?: string, monthFilter?: string) {
    const db = getDb(dbBinding);
    const currentMonthKey = new Date().toISOString().substring(0, 7); // e.g. "2026-09"

    let allIdeas: any[] = [];

    if (!monthFilter || monthFilter === 'current') {
      // Current month ideas only
      allIdeas = await db
        .select()
        .from(ideas)
        .where(like(ideas.createdAt, `${currentMonthKey}%`))
        .orderBy(desc(ideas.createdAt));
    } else if (monthFilter === 'archive') {
      // Previous months ideas (created before 1st of current month)
      const currentMonthStart = `${currentMonthKey}-01T00:00:00.000Z`;
      allIdeas = await db
        .select()
        .from(ideas)
        .where(lt(ideas.createdAt, currentMonthStart))
        .orderBy(desc(ideas.createdAt));
    } else if (monthFilter === 'all') {
      allIdeas = await db.select().from(ideas).orderBy(desc(ideas.createdAt));
    } else {
      // Specific month (e.g. "2026-08")
      allIdeas = await db
        .select()
        .from(ideas)
        .where(like(ideas.createdAt, `${monthFilter}%`))
        .orderBy(desc(ideas.createdAt));
    }

    const result = [];
    for (const idea of allIdeas) {
      const ideaDetail = await this.formatIdea(dbBinding, idea, currentUserId);
      result.push(ideaDetail);
    }

    // Sort by average coolness descending (highest rated first)
    result.sort((a, b) => b.averageCoolness - a.averageCoolness);
    return result;
  }

  async getArchiveMonths(dbBinding: D1Database): Promise<ArchiveMonthDto[]> {
    const db = getDb(dbBinding);
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    const allIdeas = await db.select({ createdAt: ideas.createdAt }).from(ideas);

    const monthMap = new Map<string, number>();

    // Always include current month in list
    monthMap.set(currentMonthKey, 0);

    for (const idea of allIdeas) {
      if (idea.createdAt && idea.createdAt.length >= 7) {
        const key = idea.createdAt.substring(0, 7);
        monthMap.set(key, (monthMap.get(key) || 0) + 1);
      }
    }

    const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map((key) => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const label = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      return {
        monthKey: key,
        label,
        count: monthMap.get(key) || 0,
        isCurrent: key === currentMonthKey,
      };
    });
  }

  async getIdeaById(dbBinding: D1Database, ideaId: string, currentUserId?: string) {
    const db = getDb(dbBinding);
    const idea = await db.query.ideas.findFirst({
      where: eq(ideas.id, ideaId),
    });

    if (!idea) {
      throw new BadRequestException('Idea pitch not found.');
    }

    return this.formatIdea(dbBinding, idea, currentUserId);
  }

  private async formatIdea(dbBinding: D1Database, idea: any, currentUserId?: string) {
    const db = getDb(dbBinding);

    const author = await db.query.users.findFirst({
      where: eq(users.id, idea.authorId),
    });
    const authorPref = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, idea.authorId),
    });

    const ideaVotes = await db.select().from(votes).where(eq(votes.ideaId, idea.id));
    const totalVotes = ideaVotes.length;
    const totalScore = ideaVotes.reduce((acc, curr) => acc + curr.coolnessScore, 0);
    const averageCoolness = totalVotes > 0 ? Number((totalScore / totalVotes).toFixed(1)) : 0;

    let userVote: number | undefined = undefined;
    if (currentUserId) {
      const myVote = ideaVotes.find((v) => v.userId === currentUserId);
      if (myVote) {
        userVote = myVote.coolnessScore;
      }
    }

    let parsedTags = [];
    try {
      parsedTags = JSON.parse(idea.tags || '[]');
    } catch (e) {
      parsedTags = [];
    }

    const currentMonthKey = new Date().toISOString().substring(0, 7);
    const ideaMonthKey = idea.createdAt ? idea.createdAt.substring(0, 7) : currentMonthKey;

    return {
      id: idea.id,
      authorId: idea.authorId,
      authorName: author?.displayName || 'Anonymous Explorer',
      authorPokemon: authorPref?.pokemon || 'pikachu',
      authorMascotQuote: authorPref?.mascotQuote || 'Always finding slick workarounds.',
      title: idea.title,
      shortDescription: idea.shortDescription,
      pitchMarkdown: idea.pitchMarkdown,
      tags: parsedTags,
      averageCoolness,
      totalVotes,
      userVote,
      createdAt: idea.createdAt,
      updatedAt: idea.updatedAt,
      isCurrentMonth: ideaMonthKey === currentMonthKey,
      monthKey: ideaMonthKey,
    };
  }
}
