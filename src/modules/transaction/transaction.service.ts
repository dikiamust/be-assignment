import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/config/database/prisma.service';
import {
  QueryTransactionList,
  SendMoneyDto,
  TopUpDto,
  WithdrawMoneyDto,
} from './dto';
import { Prisma } from '@prisma/client';
import { PaginationResponse } from 'src/common/pagination';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: PrismaService) {}

  private async convertCurrency(
    fromCurrency: string,
    toCurrency: string,
    amount: number,
  ): Promise<number> {
    const conversionRates = {
      USD: { IDR: 14000 }, // 1 USD = 14000 IDR
      IDR: { USD: 1 / 14000 }, // 1 IDR = 1/14000 USD
    };

    const rate = conversionRates[fromCurrency]?.[toCurrency];

    if (!rate) {
      throw new BadRequestException(
        `Conversion rate from ${fromCurrency} to ${toCurrency} not available.`,
      );
    }

    return amount * rate;
  }

  async topUpBySystem(dto: TopUpDto, userId: number) {
    try {
      const { currency, amount } = dto;

      const systemPaymentAccount =
        await this.prismaService.paymentAccount.findFirst({
          where: { user: { email: 'system@mail.com' } },
        });

      if (!systemPaymentAccount) {
        throw new NotFoundException(
          'System payment account not found. Please ensure that you have run the seed process to create the system payment account.',
        );
      }

      const recipientPaymentAccount =
        await this.prismaService.paymentAccount.findFirstOrThrow({
          where: { id: dto.paymentAccountId, userId },
        });

      let convertedAmount = amount;
      // Check if the recipient's currency is different from USD
      if (recipientPaymentAccount.currency !== 'USD') {
        // Convert the amount to the recipient's currency
        convertedAmount = await this.convertCurrency(
          'USD',
          recipientPaymentAccount.currency,
          amount,
        );
      }

      const transaction = await this.prismaService.transaction.create({
        data: {
          senderPaymentAccountId: systemPaymentAccount.id,
          amount,
          currency: currency,
          recipientPaymentAccountId: recipientPaymentAccount.id,
          status: TransactionStatus.PENDING,
          type: TransactionType.TOPUP,
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
        where: { id: recipientPaymentAccount.id, userId },
        data: {
          balance: recipientPaymentAccount.balance + convertedAmount,
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

  async sendMoney(
    dto: SendMoneyDto,
    userId: number,
    senderPaymentAccountId: number,
    isByScheduler: boolean = false,
  ) {
    try {
      const { recipientPaymentAccountId, externalRecipient, amount, currency } =
        dto;

      if (
        (!recipientPaymentAccountId && !externalRecipient) ||
        (recipientPaymentAccountId && externalRecipient)
      ) {
        throw new BadRequestException(
          'Either recipientPaymentAccountId or externalRecipient must be provided, but not both or neither.',
        );
      }

      if (
        recipientPaymentAccountId &&
        recipientPaymentAccountId === senderPaymentAccountId
      ) {
        throw new ForbiddenException(
          'You cannot send money to the same account (recipientPaymentAccountId cannot be the same as senderPaymentAccountId).',
        );
      }

      const senderPaymentAccount =
        await this.prismaService.paymentAccount.findFirst({
          where: { id: senderPaymentAccountId, userId },
        });

      if (!senderPaymentAccount) {
        throw new NotFoundException('Sender Payment Account not found.');
      }

      let balanceSenderPaymentAccount = senderPaymentAccount.balance - amount;
      let senderConvertedAmount = amount;
      if (senderPaymentAccount.currency !== currency) {
        senderConvertedAmount = await this.convertCurrency(
          currency,
          senderPaymentAccount.currency,
          amount,
        );

        balanceSenderPaymentAccount =
          senderPaymentAccount.balance - senderConvertedAmount;
      }

      // Check if the balance is sufficient after conversion
      if (senderPaymentAccount.balance < senderConvertedAmount) {
        throw new BadRequestException('Insufficient balance');
      }

      let recipientPaymentAccount;
      let balanceRecipientPaymentAccount;
      let recipientConvertedAmount = amount;
      if (recipientPaymentAccountId) {
        recipientPaymentAccount =
          await this.prismaService.paymentAccount.findFirst({
            where: { id: recipientPaymentAccountId },
          });

        if (!recipientPaymentAccount) {
          throw new NotFoundException('Recipient Payment Account not found.');
        }

        balanceRecipientPaymentAccount =
          recipientPaymentAccount.balance + amount;

        if (recipientPaymentAccount.currency !== currency) {
          recipientConvertedAmount = await this.convertCurrency(
            currency,
            recipientPaymentAccount?.currency,
            amount,
          );

          balanceRecipientPaymentAccount =
            recipientPaymentAccount.balance + recipientConvertedAmount;
        }
      }

      // This ensures that the transaction record is saved even if an error occurs later.
      const transaction = await this.prismaService.transaction.create({
        data: {
          senderPaymentAccountId: senderPaymentAccount.id,
          recipientPaymentAccountId: recipientPaymentAccount?.id,
          amount,
          currency,
          externalRecipient,
          status: TransactionStatus.PENDING,
          type: TransactionType.SEND,
          isByScheduler,
        },
      });

      // Simulate long-running process (e.g., 30 seconds)
      await this.simulateTransactionProcessing(transaction);

      const result = await this.prismaService.$transaction(async (prisma) => {
        const updatedTransaction = await prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: TransactionStatus.COMPLETED },
        });

        await prisma.paymentAccount.update({
          where: { id: senderPaymentAccount.id, userId },
          data: {
            balance: balanceSenderPaymentAccount,
          },
        });

        if (recipientPaymentAccountId) {
          await prisma.paymentAccount.update({
            where: { id: recipientPaymentAccount?.id },
            data: {
              balance: balanceRecipientPaymentAccount,
            },
          });
        }

        return updatedTransaction;
      });

      return result;
    } catch (error) {
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  async withdrawMoney(
    dto: WithdrawMoneyDto,
    userId: number,
    senderPaymentAccountId: number,
  ) {
    try {
      const { externalRecipient, amount, currency } = dto;

      const senderPaymentAccount =
        await this.prismaService.paymentAccount.findFirstOrThrow({
          where: { id: senderPaymentAccountId, userId },
        });

      let balanceSenderPaymentAccount = senderPaymentAccount.balance - amount;
      let senderConvertedAmount = amount;
      if (senderPaymentAccount.currency !== currency) {
        senderConvertedAmount = await this.convertCurrency(
          currency,
          senderPaymentAccount.currency,
          amount,
        );

        balanceSenderPaymentAccount =
          senderPaymentAccount.balance - senderConvertedAmount;
      }

      // Check if the balance is sufficient for the transaction
      if (senderPaymentAccount?.balance < senderConvertedAmount) {
        throw new BadRequestException('Insufficient balance');
      }

      // This ensures that the transaction record is saved even if an error occurs later.
      const transaction = await this.prismaService.transaction.create({
        data: {
          senderPaymentAccountId: senderPaymentAccount.id,
          amount,
          currency: currency,
          externalRecipient: externalRecipient,
          status: TransactionStatus.PENDING,
          type: TransactionType.WITHDRAW,
        },
      });

      // Simulate long-running process (e.g., 30 seconds)
      await this.simulateTransactionProcessing(transaction);

      const result = await this.prismaService.$transaction(async (prisma) => {
        const updatedTransaction = await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.COMPLETED,
          },
        });

        await prisma.paymentAccount.update({
          where: { id: senderPaymentAccount.id, userId },
          data: {
            balance: balanceSenderPaymentAccount,
          },
        });

        return updatedTransaction;
      });

      return result;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Payment account not found.');
      }
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  private async simulateTransactionProcessing(transaction) {
    return new Promise((resolve, reject) => {
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

      const paymentAccount =
        await this.prismaService.paymentAccount.findFirstOrThrow({
          where: { id: paymentAccountId, userId },
        });

      let where: Prisma.TransactionWhereInput = {
        OR: [
          { senderPaymentAccountId: paymentAccountId },
          { recipientPaymentAccountId: paymentAccountId },
        ],
      };

      if (query.flow) {
        if (query.flow === 'in') {
          where = {
            recipientPaymentAccountId: paymentAccountId,
          };
        } else if (query.flow === 'out') {
          where = {
            senderPaymentAccountId: paymentAccountId,
          };
        }
      }

      const transaction = await this.prismaService.transaction.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where,
        skip,
        take,
      });

      const countTransaction = await this.prismaService.transaction.count({
        where,
      });

      return PaginationResponse(
        transaction,
        countTransaction,
        query?.page,
        query?.limit,
      );
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Payment account not found.');
      }
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }
}
