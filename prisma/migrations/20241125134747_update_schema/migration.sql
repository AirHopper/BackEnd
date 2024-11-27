/*
  Warnings:

  - You are about to drop the column `cabinBaggage` on the `flights` table. All the data in the column will be lost.
  - Added the required column `cabin_baggage` to the `flights` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flights" DROP COLUMN "cabinBaggage",
ADD COLUMN     "cabin_baggage" INTEGER NOT NULL;
