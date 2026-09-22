import { Controller, Get, Post, Param, Body, Headers, BadRequestException } from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import type { CreateCommentDto } from '@cglabs/shared';

@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('idea/:ideaId')
  async getCommentsByIdea(
    @Param('ideaId') ideaId: string,
    @Body() body: { env?: any },
  ) {
    return this.commentsService.getCommentsByIdea(body.env.DB, ideaId);
  }

  @Post()
  async addComment(
    @Headers('x-temp-user-id') authorId: string,
    @Body() body: { comment: CreateCommentDto; env?: any },
  ) {
    if (!authorId) throw new BadRequestException('User ID header (x-temp-user-id) required.');
    return this.commentsService.addComment(body.env.DB, authorId, body.comment);
  }
}
