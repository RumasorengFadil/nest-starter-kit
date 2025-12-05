import { Module } from '@nestjs/common';
import { CourseService } from './domain/services/course.service';

@Module({
  providers: [CourseService]
})
export class CourseModule {}
