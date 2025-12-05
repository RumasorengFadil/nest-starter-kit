import { Module } from '@nestjs/common';
import { CourseService } from './domain/services/course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './domain/entities/course.entity';
import { CourseController } from './infrastructure/http/course.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  providers: [CourseService],
  controllers: [CourseController],
})
export class CourseModule {}
