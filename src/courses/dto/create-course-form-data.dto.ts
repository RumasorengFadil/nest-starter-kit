import { CreateCourseDto } from './create-course.dto';
import { ApiProperty } from '@nestjs/swagger';
import { OmitType } from '@nestjs/mapped-types';

export class CreateCourseFormDataDto extends OmitType(CreateCourseDto, [] as const) {
  @ApiProperty({ type: 'string', format: 'binary' })
  image: any;
}
