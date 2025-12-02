import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { join } from 'path';
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

  /**
   * Validate the uploaded file for existence, MIME type, and size.
   */
  validateFile(file: Express.Multer.File, required: boolean) {
    // Throw error if file is required but missing
    if (required && !file) {
      throw new BadRequestException('File is required');
    }

    // Check MIME type
    if (!this.uploadCfg.allowedMime.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: ' + this.uploadCfg.allowedMime.join(', '),
      );
    }

    // Check file size
    if (file.size > this.uploadCfg.maxSize) {
      throw new BadRequestException(
        `File too large. Max size: ${this.uploadCfg.maxSize / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * Optimize image: resize, compress, and save to disk.
   * Returns the generated filename.
   */
  async optimizeImage(
    file: Express.Multer.File,
    options?: { resize?: number; quality?: number; folder?: string },
    required: boolean = false,
  ) {
    this.validateFile(file, required);
    const { resize = 1200, quality = 80, folder = '' } = options || {};

    // Compute upload directory path
    const uploadDir = join(this.uploadCfg.basePath, folder);

    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${folder ? folder + '_' : ''}${Date.now()}.webp`;
    const outputPath = join(uploadDir, filename);

    // Convert to WebP and apply compression & resize
    await sharp(file.buffer)
      .resize(resize)
      .webp({ quality })
      .toFile(outputPath);

    return filename;
  }

  /**
   * Delete a file from disk if it exists.
   */
  deleteFile(filename: string, folder: string) {
    if (!filename) return;

    const filePath = join(this.uploadCfg.basePath, folder, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Replace an existing file with a new one:
   * 1. Delete the old file
   * 2. Upload and optimize the new file
   * Returns the new filename
   */
  async replaceFile(
    oldFilename: string,
    newFile: Express.Multer.File,
    folder: string,
  ) {
    // Delete old file
    this.deleteFile(oldFilename, folder);

    // Upload and optimize new file
    const newFilename = await this.optimizeImage(newFile, { folder });

    return newFilename;
  }
}
