import {
  Controller,
  Post,
  UseGuards,
  Request,
  Response,
  Get,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response as ExResponse } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../domain/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'User info returned successfully' })
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@GetUser() user) {
    return user;
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: '12345678' },
        name: { type: 'string', example: 'John Doe' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    const user = await this.authService.register(body.email, body.password);
    return { ok: true, user: { id: user.id, email: user.email } };
  }

  @ApiOperation({ summary: 'Login user and get tokens' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: '12345678' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req,
    @Response({ passthrough: true }) res: ExResponse,
  ) {
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

  @ApiOperation({
    summary: 'Redirect to Google OAuth Login',
    description:
      'This endpoint redirects the user to Google sign-in page. Cannot be tested via Swagger.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // initiates Google OAuth2 login flow
  }

  @ApiOperation({ summary: 'Google OAuth callback handler' })
  @ApiResponse({ status: 200, description: 'Google login successful' })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Request() req,
    @Response({ passthrough: true }) res: ExResponse,
  ) {
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

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @Post('refresh')
  async refresh(
    @Request() req,
    @Response({ passthrough: true }) res: ExResponse,
  ) {
    const token = req.cookies['refresh_token'];
    if (!token) return res.status(401).json({ ok: false });

    try {
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      // payload.sub is userId
      const tokens = await this.authService.refreshTokens(payload.sub, token);

      // set cookies again
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return { ok: true };
    } catch (err) {
      return res.status(401).json({ ok: false });
    }
  }

  @ApiOperation({ summary: 'Logout user (invalidate refresh token)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @Post('logout')
  async logout(
    @Request() req,
    @Response({ passthrough: true }) res: ExResponse,
  ) {
    const userId = req.user?.userId || null;
    if (userId) {
      await this.authService.revokeRefreshToken(userId);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { ok: true };
  }
}
