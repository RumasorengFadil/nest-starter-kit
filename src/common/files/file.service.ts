import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
import { Multer } from 'multer';
import sharp from 'sharp';
import uploadConfig from 'src/config/upload.config';
import type { ConfigType } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(
    @Inject(uploadConfig.KEY)
    private readonly uploadCfg: ConfigType<typeof uploadConfig>,
  ) {}

  validateFile(file: Multer.File, required: Boolean) {
    // kalau file wajib tapi tidak ada → error
    if (required && !file) {
      throw new BadRequestException('File is required');
    }

    // 1. MIME Validation
    if (!this.uploadCfg.allowedMime.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: ' + this.uploadCfg.allowedMime.join(', '),
      );
    }

    // 2. Size Validation
    if (file.size > this.uploadCfg.maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${this.uploadCfg.maxSize / 1024 / 1024}MB`,
      );
    }
  }

  async optimizeImage(
    file: Multer.File,
    options?: { resize?: number; quality?: number; folder?: string },
    required: Boolean = false,
  ) {
    this.validateFile(file, required);
    const { resize = 1200, quality = 80, folder = '' } = options || {};

    // Determine saving path
    const uploadDir = join(this.uploadCfg.basePath, folder);

    // Make a directory, if there no directory
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${folder ? folder + '_' : ''}${Date.now()}.webp`;

    const outputPath = join(uploadDir, filename);

    // Convert & compress
    await sharp(file.buffer)
      .resize(resize)
      .webp({ quality })
      .toFile(outputPath);

    return filename;
  }

  async deleteFile(filename: string, folder: string) {
    if (!filename) return;

    const filePath = join(this.uploadCfg.basePath, folder, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async replaceFile(oldFilename: string, newFile: Multer.File, folder: string) {
    // delete old
    await this.deleteFile(oldFilename, folder);

    // upload + optimize new
    const newFilename = await this.optimizeImage(newFile, { folder });

    return newFilename;
  }
}
