import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreatePaymentAccountDto, QueryPaymentAccountkList } from './dto';
import { PaymentAccountService } from './payment-account.service';
import { createPaymentAccount, paymentAccountList } from './example-response';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorators';
import { IUserData } from 'src/guards/strategy/interface/user-data.interface';

@ApiTags('Payment-Account')
@ApiBearerAuth('authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('payment-account')
export class PaymentAccountController {
  constructor(private readonly paymentAccountService: PaymentAccountService) {}

  @ApiOperation({
    description: `Endpoint for creating a new payment account`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createPaymentAccount,
      },
    },
  })
  @Post()
  create(@User() user: IUserData, @Body() dto: CreatePaymentAccountDto) {
    return this.paymentAccountService.create(dto, user.userId);
  }

  @ApiOperation({
    description: `Endpoint to retrieve a list of all payment accounts owned by a user`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: paymentAccountList,
      },
    },
  })
  @Get()
  list(@User() user: IUserData, @Query() query: QueryPaymentAccountkList) {
    return this.paymentAccountService.list(query, user.userId);
  }

  @ApiOperation({
    description: `Endpoint for updating a payment accounts`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createPaymentAccount,
      },
    },
  })
  @Put(':paymentAccountId')
  update(
    @Param('paymentAccountId') paymentAccountId: number,
    @Body() dto: CreatePaymentAccountDto,
    @User() user: IUserData,
  ) {
    return this.paymentAccountService.update(
      dto,
      paymentAccountId,
      user.userId,
    );
  }
}
