import { AccountType, Currency, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const isUserAsSystemAlreadyExist = await prisma.user.findFirst({
    where: {
      email: 'system@mail.com',
    },
  });

  if (!isUserAsSystemAlreadyExist) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash('Aa!45678', salt);
    // User as system
    const user = await prisma.user.create({
      data: {
        name: 'system',
        email: 'system@mail.com',
        password: hash,
        salt,
      },
    });

    const systemPaymentAccount = await prisma.paymentAccount.create({
      data: {
        userId: user.id,
        balance: 1000000,
        type: AccountType.DEBIT,
        currency: Currency.USD,
      },
    });
  }
}

main()
  .then(() => {
    console.log('Seeding completed.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
