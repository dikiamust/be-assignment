import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { LoggerMiddleware } from './middlewares';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentAccountModule } from './modules/payment-account/payment-account.module';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './modules/transaction/transaction.module';
import { RecurringPaymentModule } from './modules/recurring-payment/recurring-payment.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    PaymentAccountModule,
    TransactionModule,
    RecurringPaymentModule,
    CacheModule.register({
      ttl: 5 * 1000, // time to live (TTL) in seconds (5 seconds)
      max: 10, // the maximum number of items to store in cache memory
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
