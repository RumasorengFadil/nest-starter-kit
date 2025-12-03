import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigService, ConfigType } from '@nestjs/config';
import mailConfig from 'src/config/mail.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [mailConfig.KEY],
      useFactory: async (config: ConfigType <typeof mailConfig>) => ({
        transport: {
          host: config.host,
          port: Number(config.port),
          secure: config.secure,
          auth: {
            user: config.auth.user,
            pass: config.auth.pass,
          },
        },
        defaults: {
          from: '"LMS Support" <noreply@yourapp.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
