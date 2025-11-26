import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  coursePath: process.env.UPLOAD_PATH ?? './uploads/courses',
  maxSize: parseInt(process.env.UPLOAD_MAX_SIZE ?? '') || 2 * 1024 * 1024,
  allowedMime: process.env.ALLOWED_MIME ?? [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
}));
