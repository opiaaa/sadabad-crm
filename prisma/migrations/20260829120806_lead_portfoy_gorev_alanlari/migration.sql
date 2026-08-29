-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "listingNumber" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "listingNumber" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "description" TEXT;
