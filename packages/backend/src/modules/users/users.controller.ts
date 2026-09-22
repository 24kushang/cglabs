import { Controller, Post, Body, Headers } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('init')
  async initTempUser(
    @Headers('x-temp-user-id') headerUserId: string,
    @Body() body: { userId?: string; displayName?: string; env?: any },
  ) {
    const targetUserId = body.userId || headerUserId || crypto.randomUUID();
    const env = body.env;
    return this.usersService.getOrCreateTempUser(env.DB, targetUserId, body.displayName);
  }
}
