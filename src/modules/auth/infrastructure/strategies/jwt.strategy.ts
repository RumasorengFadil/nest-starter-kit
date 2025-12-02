import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// extractor that reads cookie named 'access_token'
const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) token = req.cookies['access_token'];
  // fallback to Authorization header
  if (!token && req && req.headers && req.headers.authorization) {
    const [type, value] = req.headers.authorization.split(' ');
    if (type === 'Bearer') token = value;
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    // payload.sub contains user id
    return { userId: payload.sub, email: payload.email, provider: payload.provider };
  }
}
