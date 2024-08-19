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
import {
  QueryTransactionList,
  SendMoneyDto,
  TopUpDto,
  WithdrawMoneyDto,
} from './dto';
import {
  createSenMoneyTransaction,
  createTopupTransaction,
  createWithdrawTransaction,
  transactionList,
} from './example-response';
import { Currency } from '@prisma/client';

@ApiTags('Transaction')
@ApiBearerAuth('authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({
    description: `Endpoint to top-up funds from the system. Available currencies: ${Object.values(
      Currency,
    )}`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createTopupTransaction,
      },
    },
  })
  @Post('top-up')
  topUp(@User() user: IUserData, @Body() dto: TopUpDto) {
    return this.transactionService.topUpBySystem(dto, user.userId);
  }

  @ApiOperation({
    description: `Endpoint to send money. You can send money to a payment account in this app or to an external recipient, but not both at the same time. Available currencies: ${Object.values(
      Currency,
    )}`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createSenMoneyTransaction,
      },
    },
  })
  @Post('send/:senderPaymentAccountId')
  sendMoney(
    @User() user: IUserData,
    @Body() dto: SendMoneyDto,
    @Param('senderPaymentAccountId') senderPaymentAccountId: number,
  ) {
    return this.transactionService.sendMoney(
      dto,
      user.userId,
      senderPaymentAccountId,
    );
  }

  @ApiOperation({
    description: `Endpoint to withdraw money. You can withdraw funds from your payment account to your external account. Available currencies: ${Object.values(
      Currency,
    )}`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createWithdrawTransaction,
      },
    },
  })
  @Post('withdraw/:senderPaymentAccountId')
  withdrawMoney(
    @User() user: IUserData,
    @Body() dto: WithdrawMoneyDto,
    @Param('senderPaymentAccountId') senderPaymentAccountId: number,
  ) {
    return this.transactionService.withdrawMoney(
      dto,
      user.userId,
      senderPaymentAccountId,
    );
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
