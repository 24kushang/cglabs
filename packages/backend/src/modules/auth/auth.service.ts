import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users, userPreferences } from '../../db/schema.js';
import type { D1Database } from '@cloudflare/workers-types';
import { getDb } from '../../db/connection.js';
import type { RegisterDto, LoginDto, UserDto } from '@cglabs/shared';
import { signJwt, verifyJwt } from './jwt.util.js';

@Injectable()
export class AuthService {
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'cglabs_salt_v1');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async register(d1: D1Database, dto: RegisterDto, jwtSecret: string) {
    const username = dto.username ? String(dto.username).trim().toLowerCase() : '';
    const password = dto.password ? String(dto.password).trim() : '';

    if (!username || username.length < 3) {
      throw new BadRequestException('Username is required and must be at least 3 characters.');
    }
    if (!password || password.length < 4) {
      throw new BadRequestException('Password must be at least 4 characters long.');
    }

    const db = getDb(d1);
    const existing = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existing) {
      throw new BadRequestException(`Username '@${username}' is already taken. Please choose another.`);
    }

    const userId = crypto.randomUUID();
    const passwordHash = await this.hashPassword(password);
    const nowIso = new Date().toISOString();

    await db.insert(users).values({
      id: userId,
      username,
      passwordHash,
      displayName: username,
      isTemporary: false,
      expiresAt: 0,
      createdAt: nowIso,
    });

    // Create default preferences
    const defaultPrefs = {
      id: crypto.randomUUID(),
      userId,
      themePresetId: 'cyberpunk',
      primaryColor: '#eab308',
      secondaryColor: '#eab308',
      mode: 'dark',
      fontFamily: 'Inter',
      borderRadius: 10,
      density: 'comfortable',
      pokemon: 'pikachu',
      mascotQuote: 'Sparking high-voltage breakthroughs with relentless energy.',
      customizedAt: nowIso,
      isConfigured: false,
    };

    await db.insert(userPreferences).values(defaultPrefs);

    const userDto: UserDto = {
      id: userId,
      username,
      displayName: username,
      isTemporary: false,
      createdAt: nowIso,
    };

    // Issue signed JWT token (expires in 30 days)
    const token = await signJwt(
      {
        sub: userId,
        username,
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      },
      jwtSecret
    );

    return {
      user: userDto,
      token,
      preferences: defaultPrefs,
    };
  }

  async login(d1: D1Database, dto: LoginDto, jwtSecret: string) {
    const username = dto.username ? String(dto.username).trim().toLowerCase() : '';
    const password = dto.password ? String(dto.password).trim() : '';

    if (!username || !password) {
      throw new BadRequestException('Username and password are required.');
    }

    const db = getDb(d1);
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const inputHash = await this.hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    const userDto: UserDto = {
      id: user.id,
      username: user.username,
      displayName: user.username,
      isTemporary: user.isTemporary,
      createdAt: user.createdAt,
    };

    // Issue signed JWT token (expires in 30 days)
    const token = await signJwt(
      {
        sub: user.id,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      },
      jwtSecret
    );

    return {
      user: userDto,
      token,
      preferences: prefs,
    };
  }

  async resolveUserId(tokenOrId: string, jwtSecret: string): Promise<string | null> {
    if (!tokenOrId) return null;
    const jwtPayload = await verifyJwt(tokenOrId, jwtSecret);
    if (jwtPayload && jwtPayload.sub) {
      return jwtPayload.sub;
    }
    return tokenOrId;
  }

  async getMe(d1: D1Database, tokenOrId: string, jwtSecret: string) {
    if (!tokenOrId) return null;
    const resolvedUserId = await this.resolveUserId(tokenOrId, jwtSecret);
    if (!resolvedUserId) return null;

    const db = getDb(d1);
    const user = await db.query.users.findFirst({
      where: eq(users.id, resolvedUserId),
    });
    if (!user) return null;

    const prefs = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    return {
      user: {
        id: user.id,
        username: user.username || user.displayName,
        displayName: user.username || user.displayName,
        isTemporary: user.isTemporary,
        createdAt: user.createdAt,
      },
      preferences: prefs,
    };
  }
}

