import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/modules/auth/infrastructure/http/get-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/http/jwt-auth.guard';

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@GetUser() user) {
    return user;
  }
}
