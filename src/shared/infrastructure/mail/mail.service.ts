import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import type { ConfigType } from '@nestjs/config';
import appConfig from 'src/config/app.config';

@Injectable()
export class MailService {
  constructor(
    private mailer: MailerService,
    @Inject(appConfig.KEY)
    private readonly appCfg: ConfigType<typeof appConfig>,
  ) {}

  async sendVerificationEmail(email: string | null, token: string) {
    if (!email) return;

    const url = `${this.appCfg.appUrl}/verify-email?token=${token}`;

    await this.mailer.sendMail({
      to: email,
      subject: 'Verify your email address',
      template: 'verify-email',
      context: {
        url,
      },
    });
  }

  async sendWelcomeEmail(email: string | null, name: string) {
    if (!email) return;

    await this.mailer.sendMail({
      to: email,
      subject: 'Welcome to LMS!',
      template: 'welcome-email',
      context: { name },
    });
  }
}
