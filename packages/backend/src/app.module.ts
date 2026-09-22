import { Module } from '@nestjs/common';
import { UsersController } from './modules/users/users.controller.js';
import { UsersService } from './modules/users/users.service.js';
import { PreferencesController } from './modules/preferences/preferences.controller.js';
import { PreferencesService } from './modules/preferences/preferences.service.js';
import { IdeasController } from './modules/ideas/ideas.controller.js';
import { IdeasService } from './modules/ideas/ideas.service.js';
import { VotesController } from './modules/votes/votes.controller.js';
import { VotesService } from './modules/votes/votes.service.js';
import { CommentsController } from './modules/comments/comments.controller.js';
import { CommentsService } from './modules/comments/comments.service.js';
import { AuthService } from './modules/auth/auth.service.js';

@Module({
  imports: [],
  controllers: [
    UsersController,
    PreferencesController,
    IdeasController,
    VotesController,
    CommentsController,
  ],
  providers: [
    UsersService,
    PreferencesService,
    IdeasService,
    VotesService,
    CommentsService,
    AuthService,
  ],
})
export class AppModule {}
