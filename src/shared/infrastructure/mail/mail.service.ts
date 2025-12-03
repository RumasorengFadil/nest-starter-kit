import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import type { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';

@Injectable()
export class MailService {
  constructor(
    private mailer: MailerService, 
    @Inject(appConfig.KEY)
    private readonly appCfg: ConfigType<typeof appConfig>) {}

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.appCfg.appUrl}/verify?token=${token}`;

    await this.mailer.sendMail({
      to: email,
      subject: 'Verify your email address',
      template: './verify-email',
      context: {
        url,
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    await this.mailer.sendMail({
      to: email,
      subject: 'Welcome to LMS!',
      template: './welcome-email',
      context: { name },
    });
  }
}
