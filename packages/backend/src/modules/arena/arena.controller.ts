import { Controller, Get, Post, Query, Body, Headers, BadRequestException } from '@nestjs/common';
import { ArenaService } from './arena.service.js';
import type { ArenaVoteRequestDto, ArenaNominateDto, ArenaStartMatchDto } from '@cglabs/shared';

@Controller('api/arena')
export class ArenaController {
  constructor(private readonly arenaService: ArenaService) {}

  @Get('active-match')
  async getActiveMatch(
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { env?: any }
  ) {
    return this.arenaService.getActiveMatch(body.env.DB, userId);
  }

  @Post('vote')
  async recordAudienceVote(
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { matchId: string; votedIdeaId: string; env?: any }
  ) {
    if (!userId) {
      throw new BadRequestException('Authentication required to vote in the Arena.');
    }
    if (!body.matchId || !body.votedIdeaId) {
      throw new BadRequestException('Match ID and voted idea ID are required.');
    }
    return this.arenaService.recordAudienceVote(body.env.DB, userId, body.matchId, body.votedIdeaId);
  }

  @Post('nominate')
  async nominateIdea(
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { ideaId: string; env?: any }
  ) {
    if (!userId) {
      throw new BadRequestException('Authentication required to nominate an idea.');
    }
    if (!body.ideaId) {
      throw new BadRequestException('Idea ID is required.');
    }
    return this.arenaService.nominateIdea(body.env.DB, userId, body.ideaId);
  }

  @Get('nominated-ideas')
  async getNominatedIdeas(@Body() body: { env?: any }) {
    return this.arenaService.getNominatedIdeas(body.env.DB);
  }

  @Post('start-match')
  async startMatch(
    @Body() body: { ideaAId: string; ideaBId: string; env?: any }
  ) {
    if (!body.ideaAId || !body.ideaBId) {
      throw new BadRequestException('Both Idea A and Idea B IDs are required.');
    }
    const matchId = await this.arenaService.startMatch(body.env.DB, body.ideaAId, body.ideaBId);
    return { success: true, matchId };
  }

  @Post('conclude')
  async concludeMatch(
    @Body() body: { matchId: string; env?: any }
  ) {
    if (!body.matchId) {
      throw new BadRequestException('Match ID is required to conclude match.');
    }
    return this.arenaService.concludeMatch(body.env.DB, body.matchId);
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Query('limit') limitStr: string,
    @Body() body: { env?: any }
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : 25;
    return this.arenaService.getLeaderboard(body.env.DB, limit);
  }
}
