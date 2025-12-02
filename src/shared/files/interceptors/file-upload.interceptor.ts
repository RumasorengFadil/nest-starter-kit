import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Type,
  mixin,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';

/**
 * Dynamic interceptor for handling file uploads using Multer.
 * Supports mandatory or optional file uploads.
 */
export function FileUploadInterceptor(
  fieldName: string,
  required = false,
): Type<NestInterceptor> {
  @Injectable()
  class MixinInterceptor implements NestInterceptor {
    // Store the Multer interceptor class so we can instantiate it for each request
    private readonly multerInterceptorClass = FileInterceptor(fieldName);

    // Instance of Multer interceptor that will be executed per request
    private readonly multerInterceptor: NestInterceptor =
      new this.multerInterceptorClass();

    /**
     * Intercepts incoming requests to:
     * 1. Run Multer to handle multipart/form-data
     * 2. Validate if a required file is provided
     */
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<unknown>> {
      // Execute the Multer interceptor and wait for it to finish
      await this.multerInterceptor.intercept(context, next);

      // Get the request object from the context
      const request = context.switchToHttp().getRequest();
      const file: Express.Multer.File | undefined = request.file;

      // If the file is required but not provided → throw BadRequestException
      if (required && !file) {
        throw new BadRequestException(`File '${fieldName}' is required`);
      }

      // Continue to the next handler
      return next.handle();
    }
  }

  return mixin(MixinInterceptor);
}
