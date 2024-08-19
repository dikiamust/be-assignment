import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreatePaymentAccountDto {
  @ApiProperty({
    description: 'The type of the payment account',
    enum: AccountType,
    example: AccountType.CREDIT,
  })
  @IsNotEmpty()
  @IsString()
  @IsEnum(AccountType)
  type: AccountType;
}
