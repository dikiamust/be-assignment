import { Module } from '@nestjs/common';
import { PaymentAccountService } from './payment-account.service';
import { PaymentAccountController } from './payment-account.controller';

@Module({
  imports: [],
  providers: [PaymentAccountService],
  controllers: [PaymentAccountController],
})
export class PaymentAccountModule {}
