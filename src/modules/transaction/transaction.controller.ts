import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorators';
import { IUserData } from 'src/guards/strategy/interface/user-data.interface';
import { TransactionService } from './transaction.service';
import { SendMoneyDto } from './dto';

@ApiTags('Transaction')
@ApiBearerAuth('authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({
    description: `Send money`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: 'create',
      },
    },
  })
  @Post('send')
  sendMoney(@User() user: IUserData, @Body() dto: SendMoneyDto) {
    return this.transactionService.processTransaction(dto, user.userId);
  }

  @ApiOperation({
    description: `Withdraw money`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: 'create',
      },
    },
  })
  @Post('withdraw')
  withdrawMoney(@User() user: IUserData, @Body() dto: SendMoneyDto) {
    return this.transactionService.processTransaction(dto, user.userId);
  }
}
