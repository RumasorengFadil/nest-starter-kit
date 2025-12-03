import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './courses/courses.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { Course } from './courses/course.entity';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import uploadConfig from './config/upload.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserController } from './modules/user/infrastructure/http/user.controller';
import { MailModule } from './shared/infrastructure/mail/mail.module';
import { FilesModule } from './shared/files/file.module';
import { SearchPaginationModule } from './shared/search-pagination/search-pagination.module';
import mailConfig from './config/mail.config';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => ({
        type: 'mysql',
        host: dbConfig.host,
        port: dbConfig.port,
        username: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.name,
        entities: [Course],
        autoLoadEntities: true, // otomatis load entity
        synchronize: true, //! Jangan true di production!
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, uploadConfig, mailConfig],
      envFilePath: '.env',
      validationSchema
    }),
    CoursesModule,
    FilesModule,
    SearchPaginationModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}
