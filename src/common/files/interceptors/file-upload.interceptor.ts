import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { FilesService } from '../file.service';

export function FileUploadInterceptor(
  fieldName: string,
  required: boolean = false, // default is not mandatory
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    constructor(private readonly filesService: FilesService) {}

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      // jalankan multer interceptor
      const multer = new (FileInterceptor(fieldName) as any)(this.filesService);
      await multer.intercept(context, next);

      const request = context.switchToHttp().getRequest();
      const file = request.file;

      // kalau file wajib tapi tidak ada → error
      if (required && !file) {
        throw new BadRequestException('File is required');
      }

      // assign hasil ke request
      request.file = file;

      return next.handle();
    }
  }

  return MixinInterceptor;
}
