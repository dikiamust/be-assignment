import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from 'src/config/database/prisma.service';
import { QueryTransactionList, SendMoneyDto, WithdrawMoneyDto } from './dto';
import { Prisma } from '@prisma/client';
import { PaginationResponse } from 'src/common/pagination';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  // Process transaction for both send and withdraw
  async processTransaction(
    dto: SendMoneyDto | WithdrawMoneyDto,
    userId: number,
  ) {
    try {
      const { paymentAccountId, amount } = dto;

      const paymentAccount =
        await this.prismaService.paymentAccount.findFirstOrThrow({
          where: { id: paymentAccountId, userId },
        });

      // Validate that the balance is sufficient for the transaction
      if (paymentAccount.balance < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const transaction = await this.prismaService.transaction.create({
        data: {
          paymentAccountId,
          amount,
          currency: dto.currency,
          toAddress: dto.toAddress,
          status: TransactionStatus.PENDING,
        },
      });

      // Simulate long-running process (e.g., 30 seconds)
      await this.simulateTransactionProcessing(transaction);

      const updatedTransaction = await this.prismaService.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.COMPLETED,
        },
      });

      await this.prismaService.paymentAccount.update({
        where: { id: paymentAccountId, userId },
        data: {
          balance: paymentAccount.balance - amount,
        },
      });

      return updatedTransaction;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Payment account not found.');
      }
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  private async simulateTransactionProcessing(transaction) {
    return new Promise((resolve) => {
      console.log('Transaction processing started for:', transaction);

      // Simulate long running process
      setTimeout(() => {
        // After 30 seconds, we assume the transaction is processed successfully
        console.log('Transaction processed for:', transaction);
        resolve(transaction);
      }, 30000); // 30 seconds
    });
  }

  async getAllTransactionByPaymentAccountId(
    query: QueryTransactionList,
    paymentAccountId,
    userId: number,
  ) {
    try {
      const skip = query?.limit
        ? Number(query.limit) * Number(query.page - 1)
        : undefined;
      const take = query?.limit ? Number(query.limit) : undefined;

      const where: Prisma.TransactionWhereInput = {
        paymentAccountId,
        paymentAccount: {
          userId,
        },
      };

      const paymentAccount = await this.prismaService.transaction.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where,
        skip,
        take,
      });

      const countBook = await this.prismaService.transaction.count({
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
}
