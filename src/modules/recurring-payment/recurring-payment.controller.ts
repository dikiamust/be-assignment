import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RecurringPaymentService } from './recurring-payment.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/decorators';
import { IUserData } from 'src/guards/strategy/interface/user-data.interface';
import { CreateRecurringPaymentDto } from './dto';
import { createRecurringPayment } from './example-response';

@ApiTags('Recurring-Payment')
@ApiBearerAuth('authorization')
@UseGuards(AuthGuard('jwt'))
@Controller('recurring-payment')
export class RecurringPaymentController {
  constructor(
    private readonly recurringPaymentService: RecurringPaymentService,
  ) {}

  @ApiOperation({
    description: 'Endpoint for creating a new recurring payment.',
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: createRecurringPayment,
      },
    },
  })
  @Post()
  create(@User() user: IUserData, @Body() dto: CreateRecurringPaymentDto) {
    return this.recurringPaymentService.create(dto, user.userId);
  }
}
