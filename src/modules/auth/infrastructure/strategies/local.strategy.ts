import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../domain/services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' }); // default is username
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUserByEmail(email, password);
    if (!user) throw new UnauthorizedException("Incorrect email or password");
    
    return user;
  }
}
