import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { FilesService } from 'src/shared/files/file.service';
import { SearchPaginationService } from 'src/shared/search-pagination/search-pagination.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepo: Repository<Course>,
    private readonly filesService: FilesService,
    private readonly searchPaginationService: SearchPaginationService,
  ) {}

  /**
   * Retrieve a paginated list of courses with optional search.
   *
   * This method uses the SearchPaginationService to return courses
   * filtered by the provided search keyword (`q`) and paginated
   * according to `page` and `limit` parameters.
   *
   * The search is performed on the following fields:
   * - `title`
   * - `description`
   *
   * @param page Optional page number for pagination (default: 1)
   * @param limit Optional number of items per page (default: 10)
   * @param q Optional search keyword to filter courses by title or description
   * @returns A paginated result containing course data and metadata
   */
  findAll(page?: number, limit?: number, q?: string) {
    return this.searchPaginationService.paginate(this.courseRepo, {
      page,
      limit,
      q,
      searchFields: ['title', 'description'],
    });
  }

  /** Get a single course by ID */
  async findOne(id: string) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  /**
   * Create a new course
   * - Upload & optimize course image
   * - Save course data to database
   */
  async create(data: CreateCourseDto, file: Express.Multer.File) {
    const fileName = await this.filesService.optimizeImage(file);

    const course = this.courseRepo.create({
      ...data,
      image: fileName,
    });
    return this.courseRepo.save(course);
  }

  /**
   * Update an existing course
   * - Replace old image with new one if provided
   * - Merge updated data and save
   */
  async update(id: string, data: UpdateCourseDto, file: Express.Multer.File) {
    const course = await this.findOne(id);

    const fileName = await this.filesService.replaceFile(
      course.image,
      file,
      '',
    );

    this.courseRepo.merge(course, { ...data, image: fileName });

    return this.courseRepo.save(course);
  }

  /**
   * Remove a course by ID
   * - Delete associated image if exists
   * - Remove course from database
   */
  async remove(id: string) {
    const course = await this.findOne(id);

    if (course.image) {
      this.filesService.deleteFile(course.image, '');
    }

    return this.courseRepo.remove(course);
  }
}
