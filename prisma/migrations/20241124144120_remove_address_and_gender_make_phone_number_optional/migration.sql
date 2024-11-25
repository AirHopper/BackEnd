/*
  Warnings:

  - You are about to drop the column `gender` on the `passengers` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - Added the required column `continent` to the `airports` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `terminals` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Continent" AS ENUM ('Africa', 'Antarctica', 'Asia', 'Europe', 'North_America', 'Oceania', 'South_America');

-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expiration" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'buyer';

-- AlterTable
ALTER TABLE "airports" ADD COLUMN     "continent" "Continent" NOT NULL;

-- AlterTable
ALTER TABLE "passengers" DROP COLUMN "gender";

-- AlterTable
ALTER TABLE "terminals" DROP COLUMN "type",
ADD COLUMN     "type" "RegionType" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "gender",
ALTER COLUMN "phone_number" DROP NOT NULL;

-- DropEnum
DROP TYPE "GenderType";
