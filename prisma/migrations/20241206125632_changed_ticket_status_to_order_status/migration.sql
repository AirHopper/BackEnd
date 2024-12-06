/*
  Warnings:

  - The `ticket_status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Issued', 'Unpaid', 'Cancelled', 'Expired');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "ticket_status",
ADD COLUMN     "ticket_status" "OrderStatus" NOT NULL DEFAULT 'Unpaid';

-- DropEnum
DROP TYPE "TicketStatus";
