/*
  Warnings:

  - Changed the type of `seat_number` on the `seats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "seats" DROP COLUMN "seat_number",
ADD COLUMN     "seat_number" INTEGER NOT NULL;
