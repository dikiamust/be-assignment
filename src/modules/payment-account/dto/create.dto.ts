import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreatePaymentAccountDto {
  @ApiProperty({
    enum: AccountType,
    example: AccountType.CREDIT,
  })
  @IsNotEmpty()
  @IsString()
  type: AccountType;
}
