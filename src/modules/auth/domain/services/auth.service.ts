import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/domain/entities/user.entity';
import { AuthProvider } from 'src/modules/user/domain/provider/auth.provider';
import { VerificationToken } from '../entities/verification-token.entity';
import { randomBytes } from 'crypto';
import { MailService } from 'src/shared/infrastructure/mail/mail.service';
import { RegisterLocalDto } from '../../application/dtos/register-local.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,

    @InjectRepository(VerificationToken)
    private verificationRepo: Repository<VerificationToken>,
  ) {}

  async register({ name, email, password }: RegisterLocalDto) {
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already used');

    const hash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      name,
      email,
      password: hash,
      provider: AuthProvider.LOCAL,
    });

    await this.userRepo.save(user);

    // generate a special email verification token
    const token = randomBytes(32).toString('hex');

    const verificationToken = this.verificationRepo.create({
      token,
      user: user, // sudah disimpan di DB
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });

    this.verificationRepo.save(verificationToken);

    await this.mailService.sendVerificationEmail(user.email, token);

    return user;
  }

  async validateUserByEmail(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
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
      isEmailVerified: user.isEmailVerified,
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
    await this.userRepo.update(user.id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, providedRefreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
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
    await this.userRepo.update(userId, { refreshTokenHash: null });
  }

  // Upsert user from Google profile
  async validateOAuthLogin(profile: {
    id: string;
    emails?: any[];
    displayName?: string;
  }) {
    const email = profile.emails?.[0]?.value;
    let user = await this.userRepo.findOne({
      where: [{ providerId: profile.id }, { email }],
    });

    if (!user) {
      user = this.userRepo.create({
        email: email ?? null,
        provider: AuthProvider.GOOGLE,
        providerId: profile.id,
      });
      user = await this.userRepo.save(user);
    } else if (!user.providerId) {
      // link provider id if email exists
      user.provider = AuthProvider.GOOGLE;
      user.providerId = profile.id;
      user = await this.userRepo.save(user);
    }

    return user;
  }

  async verifyEmail(token: string) {
    const verification = await this.verificationRepo.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verification) throw new BadRequestException('Invalid token');
    if (verification.expiresAt < new Date())
      throw new BadRequestException('Token expired');

    verification.user.isEmailVerified = true;

    await this.userRepo.save(verification.user);

    await this.verificationRepo.delete(verification.id);

    await this.mailService.sendWelcomeEmail(
      verification.user.email,
      verification.user.name,
    );

    return { message: 'Email verified successfully' };
  }
}
