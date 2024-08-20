import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'K*P&sD21' })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E]{8,16}$/,
    {
      message:
        'Password must contain at least one lower character, one upper character, one digit character, one special character and 8 characters long',
    },
  )
  password: string;

  @ApiProperty({ example: 'K*P&sD21' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
