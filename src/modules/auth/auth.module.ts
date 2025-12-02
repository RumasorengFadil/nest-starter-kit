import { Module } from '@nestjs/common';
import { HttpController } from './infrastructure/http/http.controller';
import { AuthController } from './infrastructure/http/auth/auth.controller';
import { AuthControllerController } from './infrastructure/http/auth.controller/auth.controller.controller';
import { AuthController } from './infrastructure/http/auth.controller';
import { AuthControllerController } from './infrastructure/http/auth.controller/auth.controller.controller';

@Module({
  controllers: [HttpController, AuthController, AuthControllerController]
})
export class AuthModule {}
