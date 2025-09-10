/*
  Warnings:

  - Added the required column `hallId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "hallId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_hallId_fkey" FOREIGN KEY ("hallId") REFERENCES "Hall"("hallId") ON DELETE RESTRICT ON UPDATE CASCADE;
