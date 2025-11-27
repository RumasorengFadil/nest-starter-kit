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
import { FilesModule } from './common/files/file.module';
import { SearchPaginationModule } from './common/search-pagination/search-pagination.module';

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
      load: [databaseConfig, appConfig, uploadConfig],
      envFilePath: '.env',
    }),
    CoursesModule,
    FilesModule,
    SearchPaginationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
