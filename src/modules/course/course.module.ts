import { Module } from '@nestjs/common';
import { CourseService } from './domain/services/course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './domain/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  providers: [CourseService],
})
export class CourseModule {}
