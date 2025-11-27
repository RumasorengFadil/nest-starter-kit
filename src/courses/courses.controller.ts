import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Multer } from 'multer';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadInterceptor } from 'src/common/files/interceptors/file-upload.interceptor';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'NestJS Mastery Course' },
        description: {
          type: 'string',
          example: 'Learn NestJS from zero to advanced',
        },
        price: { type: 'number', example: 199000 },
        image: { type: 'string', format: 'binary' },
      },
      required: ['title', 'price', 'image'],
    },
  })
  @UseInterceptors(FileUploadInterceptor('image'))
  create(
    @Body() body: CreateCourseDto,
    @UploadedFile() file: Multer.File,
  ) {
    return this.coursesService.create(body, file);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'NestJS Mastery Course' },
        description: {
          type: 'string',
          example: 'Learn NestJS from zero to advanced',
        },
        price: { type: 'number', example: 199000 },
        image: { type: 'string', format: 'binary' },
      },
      required: ['title', 'price', 'image'],
    },
  })
  @Patch(':id')
  @UseInterceptors(FileUploadInterceptor('image'))
  update(@Param('id') id: string, @Body() body: UpdateCourseDto, @UploadedFile() file: Multer.File,) {
    return this.coursesService.update(id, body, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
