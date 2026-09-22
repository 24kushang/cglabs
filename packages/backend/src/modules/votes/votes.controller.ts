import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { VotesService } from './votes.service.js';

@Controller('api/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  async castVote(
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { ideaId: string; coolnessScore: number; env?: any },
  ) {
    if (!userId) throw new BadRequestException('User ID header (x-temp-user-id) required.');
    return this.votesService.castVote(body.env.DB, body.ideaId, userId, body.coolnessScore);
  }
}
