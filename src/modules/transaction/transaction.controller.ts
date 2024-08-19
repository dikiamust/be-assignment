import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
import { QueryTransactionList, SendMoneyDto } from './dto';
import { createTransaction, transactionList } from './example-response';

@ApiTags('Transaction')
@ApiBearerAuth('authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({
    description: `Endpoint to send money`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createTransaction,
      },
    },
  })
  @Post('send')
  sendMoney(@User() user: IUserData, @Body() dto: SendMoneyDto) {
    return this.transactionService.processTransaction(dto, user.userId);
  }

  @ApiOperation({
    description: `Endpoint to withdraw money`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createTransaction,
      },
    },
  })
  @Post('withdraw')
  withdrawMoney(@User() user: IUserData, @Body() dto: SendMoneyDto) {
    return this.transactionService.processTransaction(dto, user.userId);
  }

  @ApiOperation({
    description: `Endpoint to retrieve a list of transactions for each account belonging to the user`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: transactionList,
      },
    },
  })
  @Get(':paymentAccountId')
  getAllTransactionByPaymentAccountId(
    @Query() query: QueryTransactionList,
    @Param('paymentAccountId') paymentAccountId: number,
    @User() user: IUserData,
  ) {
    return this.transactionService.getAllTransactionByPaymentAccountId(
      query,
      paymentAccountId,
      user.userId,
    );
  }
}
