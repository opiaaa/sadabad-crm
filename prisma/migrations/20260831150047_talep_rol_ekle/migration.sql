/*
  Warnings:

  - Added the required column `rol` to the `Talep` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TalepRol" AS ENUM ('ALICI', 'SATICI');

-- AlterTable
ALTER TABLE "Talep" ADD COLUMN     "rol" "TalepRol" NOT NULL;
