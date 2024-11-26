/*
  Warnings:

  - You are about to drop the column `city` on the `airports` table. All the data in the column will be lost.
  - You are about to drop the column `city_code` on the `airports` table. All the data in the column will be lost.
  - You are about to drop the column `continent` on the `airports` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `airports` table. All the data in the column will be lost.
  - You are about to drop the column `country_code` on the `airports` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[full_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cityId` to the `airports` table without a default value. This is not possible if the table is not empty.
  - Made the column `capacity` on table `flights` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `full_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "airports" DROP COLUMN "city",
DROP COLUMN "city_code",
DROP COLUMN "continent",
DROP COLUMN "country",
DROP COLUMN "country_code",
ADD COLUMN     "cityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "flights" ALTER COLUMN "capacity" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username",
ADD COLUMN     "full_name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "cities" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "continent" "Continent" NOT NULL,
    "imageUrl" TEXT,
    "imageId" TEXT,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_code_key" ON "cities"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_full_name_key" ON "users"("full_name");

-- AddForeignKey
ALTER TABLE "airports" ADD CONSTRAINT "airports_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
