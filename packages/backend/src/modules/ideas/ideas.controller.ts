import { Controller, Get, Post, Param, Query, Body, Headers, BadRequestException } from '@nestjs/common';
import { IdeasService } from './ideas.service.js';
import type { CreateIdeaDto } from '@cglabs/shared';

@Controller('api/ideas')
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Get()
  async getAllIdeas(
    @Query('month') month: string,
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { env?: any },
  ) {
    return this.ideasService.getAllIdeas(body.env.DB, userId, month);
  }

  @Get('archive/months')
  async getArchiveMonths(@Body() body: { env?: any }) {
    return this.ideasService.getArchiveMonths(body.env.DB);
  }

  @Get(':id')
  async getIdeaById(
    @Param('id') ideaId: string,
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { env?: any },
  ) {
    return this.ideasService.getIdeaById(body.env.DB, ideaId, userId);
  }

  @Post()
  async createIdea(
    @Headers('x-temp-user-id') authorId: string,
    @Body() body: { idea: CreateIdeaDto; env?: any },
  ) {
    if (!authorId) throw new BadRequestException('User ID header (x-temp-user-id) required.');
    return this.ideasService.createIdea(body.env.DB, authorId, body);
  }
}
