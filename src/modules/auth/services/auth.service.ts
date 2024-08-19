import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SigninDto, SignupDto } from '../dto';
import { TokenAuthService } from './token-auth.service';
import { PrismaService } from 'src/config/database/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenAuthService: TokenAuthService,
  ) {}

  async signup(dto: SignupDto) {
    const { name, email, password, confirmPassword } = dto;
    try {
      if (password !== confirmPassword) {
        throw new BadRequestException(
          'The password and confirmation password do not match.',
        );
      }

      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const user = await this.prismaService.user.create({
        data: {
          name,
          email,
          password: hash,
          salt,
        },
      });

      const token = await this.tokenAuthService.signToken(user.id);
      return {
        message: 'Registration successful.',
        token,
      };
    } catch (error) {
      let errorMessage = error?.message || 'Something went wrong';
      if (error?.code === 'P2002') {
        errorMessage = 'email already exist.';
      }
      throw new BadRequestException(errorMessage);
    }
  }

  async signin(dto: SigninDto) {
    try {
      const { email, password, confirmPassword } = dto;
      if (password !== confirmPassword) {
        throw new BadRequestException(
          'The password and confirmation password do not match.',
        );
      }

      const user = await this.prismaService.user.findFirst({
        where: { email },
      });

      if (!user) {
        throw new ForbiddenException(
          'The email or password you provided is incorrect.',
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new ForbiddenException(
          'The email or password you provided is incorrect.',
        );
      }

      const token = await this.tokenAuthService.signToken(user.id);

      return {
        message: 'Login successful.',
        token,
      };
    } catch (error) {
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }
}
