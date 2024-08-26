import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Currency, PaymentInterval, TransactionType } from '@prisma/client';

export class CreateRecurringPaymentDto {
  @ApiProperty({ example: 1, description: 'ID of the payment account' })
  @IsNumber()
  @IsNotEmpty()
  paymentAccountId: number;

  @ApiProperty({ example: 100.0, description: 'Amount to be paid' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 'USD',
    description: 'Currency of the payment',
    enum: Currency,
  })
  @IsString()
  @IsNotEmpty()
  currency: Currency;

  @ApiProperty({
    example: 'MONTHLY',
    description: 'Payment interval',
    enum: PaymentInterval,
  })
  @IsString()
  @IsNotEmpty()
  interval: PaymentInterval;

  @ApiProperty({
    example: TransactionType.SEND,
    description: 'Transaction type',
    enum: TransactionType,
  })
  @IsString()
  @IsNotEmpty()
  transactionType: TransactionType;

  @ApiProperty({
    example: 2,
    description: 'ID of the recipient payment account',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  recipientPaymentAccountId?: number;

  @ApiProperty({
    example: 'recipient@example.com',
    description: 'External recipient email address',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalRecipient?: string;
}
