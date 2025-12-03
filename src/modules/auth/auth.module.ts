import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './domain/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { AuthController } from './infrastructure/http/auth.controller';
import { User } from '../user/domain/entities/user.entity';
import { MailModule } from 'src/shared/infrastructure/mail/mail.module';
import { VerificationToken } from './domain/entities/verification-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, VerificationToken]),
    PassportModule,
    JwtModule.register({}), // config via AuthService dynamic usage
    MailModule,
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, GoogleStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
