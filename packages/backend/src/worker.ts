import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { UsersService } from './modules/users/users.service.js';
import { PreferencesService } from './modules/preferences/preferences.service.js';
import { IdeasService } from './modules/ideas/ideas.service.js';
import { VotesService } from './modules/votes/votes.service.js';
import { CommentsService } from './modules/comments/comments.service.js';
import { AuthService } from './modules/auth/auth.service.js';
import { ArenaService } from './modules/arena/arena.service.js';
import { ensureTablesCreated } from './db/connection.js';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

let appInstance: any = null;

async function getAppInstance() {
  if (!appInstance) {
    appInstance = await NestFactory.createApplicationContext(AppModule, { logger: false });
  }
  return appInstance;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Ensure database tables exist in local D1 / SQLite
    if (env && env.DB) {
      await ensureTablesCreated(env.DB);
    } else {
      console.warn('[DB] ⚠️ env.DB binding is missing from context!');
    }

    console.log(`[API] 📥 ${request.method} ${url.pathname}${url.search}`);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-temp-user-id, Authorization',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-temp-user-id, Authorization',
      'Content-Type': 'application/json',
    };

    try {
      const app = await getAppInstance();
      const authService = app.get(AuthService);
      const jwtSecret = env.JWT_SECRET || 'cglabs_fallback_jwt_secret_v1';

      const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
      let rawToken = request.headers.get('x-temp-user-id') || '';
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        rawToken = authHeader.substring(7).trim();
      }

      const userId = rawToken ? ((await authService.resolveUserId(rawToken, jwtSecret)) || rawToken) : '';

      // Auth Routes
      if (url.pathname === '/api/auth/register' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const result = await authService.register(env.DB, body, jwtSecret);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const result = await authService.login(env.DB, body, jwtSecret);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        const result = await authService.getMe(env.DB, rawToken || userId, jwtSecret);
        return new Response(JSON.stringify(result || {}), { headers: corsHeaders });
      }

      if (url.pathname === '/api/preferences/claimed-pokemons' && request.method === 'GET') {
        const prefService = app.get(PreferencesService);
        const result = await prefService.getClaimedPokemons(env.DB);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      // Legacy user init fallback
      if (url.pathname === '/api/users/init' && request.method === 'POST') {
        const body = (await request.json().catch(() => ({}))) as any;
        const usersService = app.get(UsersService);
        const result = await usersService.getOrCreateTempUser(env.DB, body.userId || userId || crypto.randomUUID(), body.displayName);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/preferences' && request.method === 'GET') {
        const prefService = app.get(PreferencesService);
        const result = await prefService.getUserPreferences(env.DB, userId);
        return new Response(JSON.stringify(result || {}), { headers: corsHeaders });
      }

      if (url.pathname === '/api/preferences' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const prefService = app.get(PreferencesService);
        const result = await prefService.saveUserPreferences(env.DB, userId, body);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/ideas/archive/months' && request.method === 'GET') {
        const ideasService = app.get(IdeasService);
        const result = await ideasService.getArchiveMonths(env.DB);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/ideas' && request.method === 'GET') {
        const monthParam = url.searchParams.get('month') || 'current';
        const ideasService = app.get(IdeasService);
        const result = await ideasService.getAllIdeas(env.DB, userId, monthParam);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname.startsWith('/api/ideas/') && request.method === 'GET') {
        const ideaId = url.pathname.replace('/api/ideas/', '');
        const ideasService = app.get(IdeasService);
        const result = await ideasService.getIdeaById(env.DB, ideaId, userId);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/ideas' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const ideaDto = body.idea || body;
        const ideasService = app.get(IdeasService);
        const result = await ideasService.createIdea(env.DB, userId, ideaDto);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/votes' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const votesService = app.get(VotesService);
        const result = await votesService.castVote(env.DB, body.ideaId, userId, body.coolnessScore);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname.startsWith('/api/comments/idea/') && request.method === 'GET') {
        const ideaId = url.pathname.replace('/api/comments/idea/', '');
        const commentsService = app.get(CommentsService);
        const result = await commentsService.getCommentsByIdea(env.DB, ideaId);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/comments' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const commentDto = body.comment || body;
        const commentsService = app.get(CommentsService);
        const result = await commentsService.addComment(env.DB, userId, commentDto);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/arena/active-match' && request.method === 'GET') {
        const result = await ArenaService.getActiveMatch(env.DB, userId);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/arena/nominated-ideas' && request.method === 'GET') {
        const result = await ArenaService.getNominatedIdeas(env.DB);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/arena/nominate' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const result = await ArenaService.nominateIdea(env.DB, userId, body.ideaId);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/arena/start-match' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const matchId = await ArenaService.startMatch(env.DB, body.ideaAId, body.ideaBId);
        return new Response(JSON.stringify({ success: true, matchId }), { headers: corsHeaders });
      }

      if (url.pathname === '/api/arena/vote' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const result = await ArenaService.recordAudienceVote(env.DB, userId, body.matchId, body.votedIdeaId);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/arena/conclude' && request.method === 'POST') {
        const body = (await request.json()) as any;
        const result = await ArenaService.concludeMatch(env.DB, body.matchId);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      if (url.pathname === '/api/arena/leaderboard' && request.method === 'GET') {
        const limitStr = url.searchParams.get('limit') || '25';
        const limit = parseInt(limitStr, 10);
        const result = await ArenaService.getLeaderboard(env.DB, limit);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: corsHeaders,
      });
    } catch (err: any) {
      console.error('[API] ❌ Handler error:', err);
      return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
        status: err.status || 500,
        headers: corsHeaders,
      });
    }
  },
};
