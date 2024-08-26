import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Currency, PaymentInterval, TransactionType } from '@prisma/client';
import { PrismaService } from 'src/config/database/prisma.service';
import { CreateRecurringPaymentDto } from './dto';

@Injectable()
export class RecurringPaymentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateRecurringPaymentDto, userId: number) {
    const {
      paymentAccountId,
      amount,
      currency,
      interval,
      transactionType,
      recipientPaymentAccountId,
      externalRecipient,
    } = dto;

    if (
      (!recipientPaymentAccountId && !externalRecipient) ||
      (recipientPaymentAccountId && externalRecipient)
    ) {
      throw new BadRequestException(
        'Either recipientPaymentAccountId or externalRecipient must be provided, but not both or neither.',
      );
    }

    const paymentAccount = await this.prismaService.paymentAccount.findFirst({
      where: { id: paymentAccountId, userId },
    });

    if (!paymentAccount) {
      throw new NotFoundException('Payment Account not found.');
    }

    if (recipientPaymentAccountId) {
      const recipientPaymentAccount =
        await this.prismaService.paymentAccount.findFirst({
          where: { id: recipientPaymentAccountId },
        });

      if (!recipientPaymentAccount) {
        throw new NotFoundException('Recipient Payment Account not found.');
      }
    }

    const recurringPayment = await this.prismaService.recurringPayment.create({
      data: {
        paymentAccountId,
        amount,
        currency: currency as Currency,
        interval: interval as PaymentInterval,
        transactionType: transactionType as TransactionType,
        recipientPaymentAccountId,
        externalRecipient,
      },
    });

    return recurringPayment;
  }

  async findAll(interval: PaymentInterval) {
    try {
      return await this.prismaService.recurringPayment.findMany({
        where: {
          interval,
        },
        include: {
          paymentAccount: {
            select: {
              userId: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }
}
