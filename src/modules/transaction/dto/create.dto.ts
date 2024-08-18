import { IsNotEmpty, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

export class SendMoneyDto {
  @ApiProperty({ description: 'ID of the payment account to debit from' })
  @IsNotEmpty()
  @IsNumber()
  paymentAccountId: number;

  @ApiProperty({ description: 'Amount to transfer (must be positive)' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive value' })
  amount: number;

  @ApiProperty({
    description: 'Currency code (e.g., IDR, USD)',
    enum: Currency,
    example: Currency.IDR,
  })
  @IsNotEmpty()
  @IsString()
  currency: Currency;

  @ApiProperty({
    description: "Recipient's address",
    example: 'account1234',
  })
  @IsNotEmpty()
  @IsString()
  toAddress: string;
}

export class WithdrawMoneyDto extends SendMoneyDto {}
