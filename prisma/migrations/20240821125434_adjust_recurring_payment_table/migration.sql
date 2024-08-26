/*
  Warnings:

  - You are about to drop the column `next_payment_at` on the `recurring_payments` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `recurring_payments` table. All the data in the column will be lost.
  - Added the required column `transaction_type` to the `recurring_payments` table without a default value. This is not possible if the table is not empty.
  - Made the column `payment_account_id` on table `recurring_payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "recurring_payments" DROP CONSTRAINT "recurring_payments_payment_account_id_fkey";

-- DropForeignKey
ALTER TABLE "recurring_payments" DROP CONSTRAINT "recurring_payments_user_id_fkey";

-- AlterTable
ALTER TABLE "recurring_payments" DROP COLUMN "next_payment_at",
DROP COLUMN "user_id",
ADD COLUMN     "external_recipient" TEXT,
ADD COLUMN     "recipient_payment_account_id" INTEGER,
ADD COLUMN     "transaction_type" "TransactionType" NOT NULL,
ALTER COLUMN "payment_account_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "is_by_scheduler" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "recurring_payments" ADD CONSTRAINT "recurring_payments_payment_account_id_fkey" FOREIGN KEY ("payment_account_id") REFERENCES "payment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
