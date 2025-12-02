import { Module, Global } from '@nestjs/common';
import { FilesService } from './file.service';
import { ConfigModule } from '@nestjs/config';
import uploadConfig from 'src/config/upload.config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(uploadConfig)],
  providers: [FilesService],
  exports: [FilesService], // penting!
})
export class FilesModule {}
