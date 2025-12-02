import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { FileUploadInterceptor } from 'src/shared/files/interceptors/file-upload.interceptor';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * Get a paginated list of courses.
   *
   * Supports optional query parameters:
   * - `page`: Page number (default: 1)
   * - `limit`: Number of items per page (default: 10)
   * - `q`: Search keyword to filter courses by title or description
   *
   * @param page Optional page number for pagination
   * @param limit Optional number of items per page
   * @param q Optional search keyword
   * @returns A paginated list of courses
   */
  @Get()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search keyword',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
  ) {
    return this.coursesService.findAll(page, limit, q);
  }

  /** Get a single course by ID */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  /**
   * Create a new course
   * - Handles file upload via FileUploadInterceptor
   * - Body validated via CreateCourseDto
   */
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
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.create(body, file);
  }

  /**
   * Update an existing course
   * - Supports file replacement
   * - Body validated via UpdateCourseDto
   */
  @Patch(':id')
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
  update(
    @Param('id') id: string,
    @Body() body: UpdateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.coursesService.update(id, body, file);
  }

  /**
   * Delete a course by ID
   * - Returns HTTP 204 No Content on success
   */
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
