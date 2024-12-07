/*
  Warnings:

  - The values [Africa,America,Europe,Oceania] on the enum `Continent` will be removed. If these variants are still used in the database, this will fail.
  - The values [Adult,Child,Baby] on the enum `PassengerType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Domestic,International] on the enum `RegionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Continent_new" AS ENUM ('Afrika', 'Amerika', 'Asia', 'Europa', 'Australia');
ALTER TABLE "cities" ALTER COLUMN "continent" TYPE "Continent_new" USING ("continent"::text::"Continent_new");
ALTER TYPE "Continent" RENAME TO "Continent_old";
ALTER TYPE "Continent_new" RENAME TO "Continent";
DROP TYPE "Continent_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PassengerType_new" AS ENUM ('Dewasa', 'Anak', 'Bayi');
ALTER TABLE "passengers" ALTER COLUMN "type" TYPE "PassengerType_new" USING ("type"::text::"PassengerType_new");
ALTER TYPE "PassengerType" RENAME TO "PassengerType_old";
ALTER TYPE "PassengerType_new" RENAME TO "PassengerType";
DROP TYPE "PassengerType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RegionType_new" AS ENUM ('Domestik', 'Internasional');
ALTER TABLE "airports" ALTER COLUMN "type" TYPE "RegionType_new" USING ("type"::text::"RegionType_new");
ALTER TABLE "terminals" ALTER COLUMN "type" TYPE "RegionType_new" USING ("type"::text::"RegionType_new");
ALTER TABLE "airplanes" ALTER COLUMN "type" TYPE "RegionType_new" USING ("type"::text::"RegionType_new");
ALTER TYPE "RegionType" RENAME TO "RegionType_old";
ALTER TYPE "RegionType_new" RENAME TO "RegionType";
DROP TYPE "RegionType_old";
COMMIT;
