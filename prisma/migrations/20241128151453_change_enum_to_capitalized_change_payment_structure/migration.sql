/*
  Warnings:

  - The values [economy,premium_economy] on the enum `ClassType` will be removed. If these variants are still used in the database, this will fail.
  - The values [adult,child,baby] on the enum `PassengerType` will be removed. If these variants are still used in the database, this will fail.
  - The values [domestic,international] on the enum `RegionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [admin,buyer] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [issued,unpaid,cancelled,paid,expired] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `payment_webhook_logs` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `method` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ClassType_new" AS ENUM ('Economy', 'Premium_Economy', 'business', 'first_class');
ALTER TABLE "flights" ALTER COLUMN "class" TYPE "ClassType_new" USING ("class"::text::"ClassType_new");
ALTER TYPE "ClassType" RENAME TO "ClassType_old";
ALTER TYPE "ClassType_new" RENAME TO "ClassType";
DROP TYPE "ClassType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PassengerType_new" AS ENUM ('Adult', 'Child', 'Baby');
ALTER TABLE "passengers" ALTER COLUMN "type" TYPE "PassengerType_new" USING ("type"::text::"PassengerType_new");
ALTER TYPE "PassengerType" RENAME TO "PassengerType_old";
ALTER TYPE "PassengerType_new" RENAME TO "PassengerType";
DROP TYPE "PassengerType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RegionType_new" AS ENUM ('Domestic', 'International');
ALTER TABLE "airports" ALTER COLUMN "type" TYPE "RegionType_new" USING ("type"::text::"RegionType_new");
ALTER TABLE "terminals" ALTER COLUMN "type" TYPE "RegionType_new" USING ("type"::text::"RegionType_new");
ALTER TABLE "airplanes" ALTER COLUMN "type" TYPE "RegionType_new" USING ("type"::text::"RegionType_new");
ALTER TYPE "RegionType" RENAME TO "RegionType_old";
ALTER TYPE "RegionType_new" RENAME TO "RegionType";
DROP TYPE "RegionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('Admin', 'Buyer');
ALTER TABLE "accounts" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "accounts" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "accounts" ALTER COLUMN "role" SET DEFAULT 'Buyer';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('Issued', 'Unpaid', 'Cancelled', 'Paid', 'Europexpired');
ALTER TABLE "tickets" ALTER COLUMN "ticket_status" DROP DEFAULT;
ALTER TABLE "tickets" ALTER COLUMN "ticket_status" TYPE "TicketStatus_new" USING ("ticket_status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "TicketStatus_old";
ALTER TABLE "tickets" ALTER COLUMN "ticket_status" SET DEFAULT 'Issued';
COMMIT;

-- DropForeignKey
ALTER TABLE "payment_webhook_logs" DROP CONSTRAINT "payment_webhook_logs_payment_id_fkey";

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "role" SET DEFAULT 'Buyer';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "payload" JSONB,
DROP COLUMN "method",
ADD COLUMN     "method" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ALTER COLUMN "ticket_status" SET DEFAULT 'Issued';

-- DropTable
DROP TABLE "payment_webhook_logs";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";
