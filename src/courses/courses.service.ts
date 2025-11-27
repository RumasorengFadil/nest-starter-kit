import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Multer } from 'multer';
import { FilesService } from 'src/common/files/file.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    private readonly filesService: FilesService,
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
    const fileName = await this.filesService.optimizeImage(file);

    const course = this.courseRepo.create({
      ...data,
      image: fileName,
    });
    return this.courseRepo.save(course);
  }

  async update(id: string, data: UpdateCourseDto, file: Multer.File) {
    const course = await this.findOne(id);

    const fileName = await this.filesService.replaceFile(
      course.image,
      file,
      "",
    );

    Object.assign(course, {
      ...data,
      image: fileName,
    });
    return this.courseRepo.save(course);
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    return this.courseRepo.remove(course);
  }
}
