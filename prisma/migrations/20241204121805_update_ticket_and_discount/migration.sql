/*
  Warnings:

  - You are about to drop the column `discount` on the `discounts` table. All the data in the column will be lost.
  - Added the required column `percentage` to the `discounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discounts" DROP COLUMN "discount",
ADD COLUMN     "percentage" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
