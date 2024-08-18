import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenAuthService {
  constructor(private jwt: JwtService) {}

  async signToken(userId: number): Promise<string> {
    const payload = { userId };
    const token = await this.jwt.signAsync(payload);
    return token;
  }

  async decodeToken(token: string) {
    try {
      return await this.jwt.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Invalid or expired verification token.',
      );
    }
  }
}
