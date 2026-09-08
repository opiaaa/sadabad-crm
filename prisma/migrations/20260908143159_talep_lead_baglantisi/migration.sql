-- AlterTable
ALTER TABLE "Talep" ADD COLUMN     "leadId" TEXT;

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
