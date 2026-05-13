/*
  Warnings:

  - Made the column `status` on table `CoverLetter` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CoverLetter" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'completed';
