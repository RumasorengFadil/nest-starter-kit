import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterLocalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
