-- CreateEnum
CREATE TYPE "TalepMulkTipi" AS ENUM ('DAIRE', 'ISYERI', 'OFIS', 'IS_HANI', 'DEPO');

-- CreateEnum
CREATE TYPE "TalepSonuc" AS ENUM ('BEKLIYOR', 'KARSILANDI', 'VAZGECTI');

-- CreateTable
CREATE TABLE "Talep" (
    "id" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "il" TEXT NOT NULL,
    "ilce" TEXT NOT NULL,
    "mahalle" TEXT,
    "mulkTipi" "TalepMulkTipi" NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "description" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "sonuc" "TalepSonuc" NOT NULL DEFAULT 'BEKLIYOR',
    "assignedAgentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Talep_assignedAgentId_idx" ON "Talep"("assignedAgentId");

-- CreateIndex
CREATE INDEX "Talep_sonuc_idx" ON "Talep"("sonuc");

-- AddForeignKey
ALTER TABLE "Talep" ADD CONSTRAINT "Talep_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
