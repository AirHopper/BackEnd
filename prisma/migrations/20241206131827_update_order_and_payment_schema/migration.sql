/*
  Warnings:

  - You are about to drop the column `isRoundTrip` on the `orders` table. All the data in the column will be lost.
  - Made the column `transaction_id` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fraud_status` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `valid_until` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "isRoundTrip",
ADD COLUMN     "is_round_trip" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "transaction_id" SET NOT NULL,
ALTER COLUMN "fraud_status" SET NOT NULL,
ALTER COLUMN "valid_until" SET NOT NULL;
