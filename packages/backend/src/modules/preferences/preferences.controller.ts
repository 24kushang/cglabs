import { Controller, Get, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { PreferencesService } from './preferences.service.js';
import type { UserPreferencesDto } from '@cglabs/shared';

@Controller('api/preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  async getPreferences(
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { env?: any },
  ) {
    if (!userId) throw new BadRequestException('User ID header (x-temp-user-id) required');
    return this.preferencesService.getUserPreferences(body.env.DB, userId);
  }

  @Post()
  async savePreferences(
    @Headers('x-temp-user-id') userId: string,
    @Body() body: { preferences: UserPreferencesDto; env?: any },
  ) {
    if (!userId) throw new BadRequestException('User ID header (x-temp-user-id) required');
    return this.preferencesService.saveUserPreferences(body.env.DB, userId, body.preferences);
  }
}
