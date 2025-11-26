import { Injectable } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

@Injectable()
export class CourseImageInterceptor extends FileInterceptor('image') {}