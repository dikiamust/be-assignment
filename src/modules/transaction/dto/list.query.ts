import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination';

export class QueryTransactionList extends PaginationDto {
  @ApiProperty({
    required: false,
    example: 'in',
    enum: ['in', 'out'],
  })
  @IsOptional()
  @IsString()
  flow?: 'in' | 'out';
}
