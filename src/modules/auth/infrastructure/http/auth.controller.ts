import { Controller, Post, UseGuards, Request, Response, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response as ExResponse } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../domain/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private config: ConfigService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const user = await this.authService.register(body.email, body.password);
    return { ok: true, user: { id: user.id, email: user.email } };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Response({ passthrough: true }) res: ExResponse) {
    const user = req.user;
    const tokens = await this.authService.generateTokens(user);
    // set cookies
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return { ok: true };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // initiates Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Response({ passthrough: true }) res: ExResponse) {
    // req.user from GoogleStrategy validate -> user entity
    const user = req.user;
    const tokens = await this.authService.generateTokens(user);

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // redirect to frontend (client app)
    return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }

  @Post('refresh')
  async refresh(@Request() req, @Response({ passthrough: true }) res: ExResponse) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      return { ok: false, message: 'no refresh token' };
    }
    // extract user id from stored hashed? We need a mapping token->user: we stored hashed token in DB per user
    // A simple way: issue refresh token that is random + store hash on user record; but need user id to call refreshTokens
    // To know which user: we store userId in plain cookie? No. Alternative: make refresh token a signed JWT that contains sub=userId.
    // For simplicity, here assume refresh token is random and we search user by comparing hash (inefficient). Better: use signed refresh JWT.
    // We'll implement refresh as signed JWT below. -- For now assume refresh token is random but we included user id in cookie as httpOnly 'uid' (optional).
  }

  @Post('logout')
  async logout(@Request() req, @Response({ passthrough: true }) res: ExResponse) {
    const userId = req.user?.userId || null;
    if (userId) {
      await this.authService.revokeRefreshToken(userId);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { ok: true };
  }
}
