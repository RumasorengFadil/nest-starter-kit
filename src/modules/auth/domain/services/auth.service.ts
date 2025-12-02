import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { User } from 'src/modules/user/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new Error('Email already used');

    const hash = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({
      email,
      password: hash,
      provider: 'local',
    });
    return this.usersRepo.save(user);
  }

  async validateUserByEmail(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.password) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    // don't return password
    delete (user as any).password;
    return user;
  }

  async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      provider: user.provider,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRATION'),
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION'),
      },
    );
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.update(user.id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, providedRefreshToken: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const valid = await bcrypt.compare(
      providedRefreshToken,
      user.refreshTokenHash,
    );
    if (!valid) throw new UnauthorizedException();

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async revokeRefreshToken(userId: string) {
    await this.usersRepo.update(userId, { refreshTokenHash: null });
  }

  // Upsert user from Google profile
  async validateOAuthLogin(profile: {
    id: string;
    emails?: any[];
    displayName?: string;
  }) {
    const email = profile.emails?.[0]?.value;
    let user = await this.usersRepo.findOne({
      where: [{ providerId: profile.id }, { email }],
    });

    if (!user) {
      user = this.usersRepo.create({
        email: email ?? null,
        provider: 'google',
        providerId: profile.id,
      });
      user = await this.usersRepo.save(user);
    } else if (!user.providerId) {
      // link provider id if email exists
      user.provider = 'google';
      user.providerId = profile.id;
      user = await this.usersRepo.save(user);
    }

    return user;
  }
}
