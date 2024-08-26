import { Module } from '@nestjs/common';
import { RecurringPaymentService } from './recurring-payment.service';
import { RecurringPaymentController } from './recurring-payment.controller';
import { RecurringPaymentCronService } from './recurring-payment.cron';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TransactionModule],
  providers: [RecurringPaymentService, RecurringPaymentCronService],
  controllers: [RecurringPaymentController],
})
export class RecurringPaymentModule {}
