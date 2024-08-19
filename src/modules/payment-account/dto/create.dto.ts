import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType, Currency } from '@prisma/client';

export class CreatePaymentAccountDto {
  @ApiProperty({
    description: 'The type of the payment account',
    enum: AccountType,
    example: AccountType.DEBIT,
  })
  @IsNotEmpty()
  @IsEnum(AccountType)
  type: AccountType;

  @ApiProperty({
    enum: AccountType,
    example: Currency.USD,
  })
  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;
}
