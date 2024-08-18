import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    example: 1,
    description: 'Page number to retrieve',
    minimum: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
  })
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export type PaginationReturn<T = any[]> = {
  totalDatas: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T;
};
