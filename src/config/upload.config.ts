import { registerAs } from '@nestjs/config';

interface UploadProps {
  coursePath: string;
  basePath: string;
  maxSize: number;
  allowedMime: string[];
}
export default registerAs(
  'upload',
  (): UploadProps => ({
    coursePath: process.env.UPLOAD_PATH ?? './uploads/courses',
    basePath: process.env.UPLOAD_BASE_PATH ?? './uploads',
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE ?? '') || 4 * 1024 * 1024,
    allowedMime: process.env.ALLOWED_MIME?.split(',').filter(Boolean) ?? [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ],
  }),
);
