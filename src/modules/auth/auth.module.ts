import { Module } from '@nestjs/common';
import { HttpController } from './infrastructure/http/http.controller';

@Module({
  controllers: [HttpController]
})
export class AuthModule {}
