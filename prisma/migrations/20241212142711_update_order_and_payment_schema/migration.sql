/*
  Warnings:

  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bank_name` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `bank_va` on the `payments` table. All the data in the column will be lost.
  - Added the required column `token` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "passengers" DROP CONSTRAINT "passengers_order_id_fkey";

-- DropIndex
DROP INDEX "orders_outbound_ticket_id_key";

-- DropIndex
DROP INDEX "orders_return_ticket_id_key";

-- DropIndex
DROP INDEX "passengers_seat_id_key";

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "orders_id_seq";

-- AlterTable
ALTER TABLE "passengers" ALTER COLUMN "order_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "bank_name",
DROP COLUMN "bank_va",
ADD COLUMN     "token" TEXT NOT NULL,
ALTER COLUMN "method" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "transaction_id" DROP NOT NULL,
ALTER COLUMN "fraud_status" DROP NOT NULL,
ALTER COLUMN "valid_until" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
