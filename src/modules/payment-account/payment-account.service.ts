import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { CreatePaymentAccountDto, QueryPaymentAccountkList } from './dto';
import { Prisma } from '@prisma/client';
import { PaginationResponse } from 'src/common/pagination';

@Injectable()
export class PaymentAccountService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreatePaymentAccountDto, userId: number) {
    try {
      return await this.prismaService.paymentAccount.create({
        data: {
          type: dto.type,
          userId,
          currency: dto.currency,
        },
      });
    } catch (error) {
      let errorMessage = error?.message || 'Something went wrong';
      if (error?.code === 'P2002') {
        errorMessage = 'email already exist.';
      }
      throw new BadRequestException(errorMessage);
    }
  }

  async list(query: QueryPaymentAccountkList, userId: number) {
    try {
      const skip = query?.limit
        ? Number(query.limit) * Number(query.page - 1)
        : undefined;
      const take = query?.limit ? Number(query.limit) : undefined;

      const where: Prisma.PaymentAccountWhereInput = {
        userId,
      };

      const paymentAccount = await this.prismaService.paymentAccount.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where,
        skip,
        take,
      });

      const countBook = await this.prismaService.paymentAccount.count({
        where,
      });

      return PaginationResponse(
        paymentAccount,
        countBook,
        query?.page,
        query?.limit,
      );
    } catch (error) {
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  async update(
    dto: CreatePaymentAccountDto,
    paymentAccountId: number,
    userId: number,
  ) {
    try {
      return await this.prismaService.paymentAccount.update({
        where: { id: paymentAccountId, userId },
        data: dto,
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Payment-Account not found.');
      }
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }
}
