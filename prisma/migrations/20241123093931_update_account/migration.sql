-- AlterTable
ALTER TABLE "accounts" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otp_code" TEXT,
ADD COLUMN     "otp_expiration" TIMESTAMP(3);
