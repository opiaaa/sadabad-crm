-- AlterTable
ALTER TABLE "Interaction" ADD COLUMN     "talepId" TEXT;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_talepId_fkey" FOREIGN KEY ("talepId") REFERENCES "Talep"("id") ON DELETE SET NULL ON UPDATE CASCADE;
