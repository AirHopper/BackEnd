-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "pdf_url" TEXT,
ALTER COLUMN "qr_code_url" DROP NOT NULL;
