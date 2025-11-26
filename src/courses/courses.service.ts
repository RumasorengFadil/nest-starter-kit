import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Multer } from 'multer';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
  ) {}

  findAll() {
    return this.courseRepo.find();
  }

  async findOne(id: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(data: CreateCourseDto, file: Multer.File) {
    const course = this.courseRepo.create({
        ...data,
        image : file ? file.filename : null,
    });
    return this.courseRepo.save(course);
  }

  async update(id: string, data: UpdateCourseDto) {
    const course = await this.findOne(id);
    Object.assign(course, data);
    return this.courseRepo.save(course);
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    return this.courseRepo.remove(course);
  }
}
