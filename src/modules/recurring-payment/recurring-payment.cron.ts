import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringPaymentService } from './recurring-payment.service';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class RecurringPaymentCronService {
  constructor(
    private readonly recurringPaymentService: RecurringPaymentService,
    private readonly transactionService: TransactionService,
  ) {}

  private readonly logger = new Logger(RecurringPaymentCronService.name);

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async processRecurringPayments() {
    this.logger.log('Cronjob processRecurringPayments() started!');
    const recurringPayments = await this.recurringPaymentService.findAll(
      'MONTHLY',
    );

    if (recurringPayments?.length > 0) {
      for (const payment of recurringPayments) {
        this.logger.log(`Processed Recurring Payment: ${payment.id}`);

        switch (payment.transactionType) {
          case 'SEND':
            await this.transactionService.sendMoney(
              {
                amount: payment.amount,
                currency: payment.currency,
                recipientPaymentAccountId: payment?.recipientPaymentAccountId,
                externalRecipient: payment?.externalRecipient,
              },
              payment.paymentAccount.userId,
              payment.paymentAccountId,
              true,
            );
            break;
          case 'TOPUP':
            // TODO: Handle TOPUP case
            break;
          case 'WITHDRAW':
            //  TODO: Handle WITHDRAW case
            break;
          default:
            this.logger.warn(
              `Unknown transaction type: ${payment.transactionType}`,
            );
        }
      }
    }

    this.logger.log('Cronjob processRecurringPayments() ended!');
  }
}
