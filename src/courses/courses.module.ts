import { Module } from '@nestjs/common';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { MulterModule } from '@nestjs/platform-express';
import uploadConfig from 'src/config/upload.config';
import { ConfigType } from '@nestjs/config';
import { diskStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    MulterModule.registerAsync({
      inject: [uploadConfig.KEY],
      useFactory: (upload: ConfigType<typeof uploadConfig>) => ({
        storage: diskStorage({
          destination: upload.coursePath,
          filename: (req, file, cb) => {
            const ext = file.originalname.split('.').pop();
            cb(null, `course_${Date.now()}.${ext}`);
          },
        }),
        limits: { fileSize: upload.maxSize },
        fileFilter: (req, file, cb) => {
          if (!upload.allowedMime.includes(file.mimetype)) {
            return cb(new Error('Invalid file type'), false);
          }
          cb(null, true);
        },
      }),
    }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
