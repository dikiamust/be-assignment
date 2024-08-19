import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';

class BaseTransactionDto {
  @ApiProperty({ description: 'Amount to transfer (must be positive)' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive({ message: 'Amount must be a positive value' })
  amount: number;

  @ApiProperty({
    description: 'Currency code (e.g., USD, IDR)',
    enum: Currency,
    example: Currency.USD,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(Currency)
  currency: Currency;
}

export class TopUpDto extends BaseTransactionDto {}

export class SendMoneyDto extends BaseTransactionDto {
  @ApiProperty({
    description: `ID of recipient's payment account`,
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  recipientPaymentAccountId?: number;

  @ApiProperty({
    description: "Recipient's address",
    example: 'account1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalRecipient?: string;
}

export class WithdrawMoneyDto extends BaseTransactionDto {
  @ApiProperty({
    description: 'your account to make withdrawal',
    example: 'account1234',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  externalRecipient: string;
}
