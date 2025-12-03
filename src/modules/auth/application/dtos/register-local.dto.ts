import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { Match } from 'src/shared/validators/match.validator';

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

  @IsString()
  @MinLength(8)
  @Validate(Match, ['password'])
  confirmPassword: string;
}
