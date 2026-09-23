import { Injectable, BadRequestException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { comments, users, userPreferences } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import type { CreateCommentDto, CommentDto } from '@cglabs/shared';
import { EXP_REWARDS, getEvolutionStage } from '@cglabs/shared';
import { UsersService } from '../users/users.service.js';
import { ExpService } from '../users/exp.service.js';

@Injectable()
export class CommentsService {
  async addComment(dbBinding: D1Database, authorId: string, dto: CreateCommentDto) {
    if (!dto.content || !dto.content.trim()) {
      throw new BadRequestException('Comment content cannot be empty.');
    }

    // Ensure user record exists statically in users table for FK constraint
    await UsersService.ensureUserExists(dbBinding, authorId);

    const db = getDb(dbBinding);
    const id = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    await db.insert(comments).values({
      id,
      ideaId: dto.ideaId,
      authorId,
      parentId: dto.parentId || null,
      content: dto.content.trim(),
      createdAt: nowIso,
    });

    // Award EXP for posting a feedback comment
    await ExpService.awardExp(dbBinding, authorId, EXP_REWARDS.COMMENT_ADDED, 'Discussion Comment');

    const author = await db.query.users.findFirst({ where: eq(users.id, authorId) });
    const authorPref = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, authorId) });

    const authorLevel = authorPref?.level || 1;
    const authorEvo = getEvolutionStage(authorPref?.pokemon || 'pikachu', authorLevel);

    return {
      id,
      ideaId: dto.ideaId,
      authorId,
      authorName: author?.username || author?.displayName || 'Anonymous Creator',
      authorPokemon: authorPref?.pokemon || 'pikachu',
      authorLevel,
      authorStageName: authorEvo.currentStage.name,
      authorStageImage: authorEvo.currentStage.imageUrl,
      parentId: dto.parentId || null,
      content: dto.content.trim(),
      createdAt: nowIso,
      replies: [],
    };
  }

  async getCommentsByIdea(dbBinding: D1Database, ideaId: string): Promise<CommentDto[]> {
    const db = getDb(dbBinding);
    const allComments = await db
      .select()
      .from(comments)
      .where(eq(comments.ideaId, ideaId))
      .orderBy(desc(comments.createdAt));

    const commentMap = new Map<string, CommentDto>();
    const rootComments: CommentDto[] = [];

    for (const c of allComments) {
      const author = await db.query.users.findFirst({ where: eq(users.id, c.authorId) });
      const authorPref = await db.query.userPreferences.findFirst({ where: eq(userPreferences.userId, c.authorId) });

      const authorLevel = authorPref?.level || 1;
      const authorEvo = getEvolutionStage(authorPref?.pokemon || 'pikachu', authorLevel);

      const formatted: CommentDto = {
        id: c.id,
        ideaId: c.ideaId,
        authorId: c.authorId,
        authorName: author?.username || author?.displayName || 'Anonymous Creator',
        authorPokemon: (authorPref?.pokemon as any) || 'pikachu',
        authorLevel,
        authorStageName: authorEvo.currentStage.name,
        authorStageImage: authorEvo.currentStage.imageUrl,
        parentId: c.parentId,
        content: c.content,
        createdAt: c.createdAt,
        replies: [],
      };
      commentMap.set(c.id, formatted);
    }

    for (const c of commentMap.values()) {
      if (c.parentId && commentMap.has(c.parentId)) {
        commentMap.get(c.parentId)!.replies!.push(c);
      } else {
        rootComments.push(c);
      }
    }

    return rootComments;
  }
}
