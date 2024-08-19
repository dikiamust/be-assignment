import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from '../services';
import { SigninDto, SignupDto } from '../dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { signin, signup } from '../example-response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    description: `Endpoint for user registration`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: signup,
      },
    },
  })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @ApiOperation({
    description: `Endpoint for user login`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: signin,
      },
    },
  })
  @HttpCode(200)
  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
}
