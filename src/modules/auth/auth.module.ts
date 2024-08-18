import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService, TokenAuthService } from './services';
import { AuthController } from './controllers';
import { JwtStrategy } from 'src/guards/strategy/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_EXPIRE,
        },
      }),
    }),
  ],
  providers: [AuthService, TokenAuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
