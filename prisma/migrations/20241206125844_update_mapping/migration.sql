/*
  Warnings:

  - You are about to drop the column `ticket_status` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "ticket_status",
ADD COLUMN     "order_status" "OrderStatus" NOT NULL DEFAULT 'Unpaid';
