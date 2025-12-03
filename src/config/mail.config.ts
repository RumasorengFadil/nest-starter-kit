import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMSMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  jwtVerificationSecret: process.env.JWT_VERIFICATION_SECRET
}));
