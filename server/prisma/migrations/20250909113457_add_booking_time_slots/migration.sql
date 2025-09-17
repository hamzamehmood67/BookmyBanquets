/*
  Warnings:

  - Added the required column `duration` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSlot` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSlotLabel` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "timeSlot" TEXT NOT NULL,
ADD COLUMN     "timeSlotLabel" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isActive" SET DEFAULT false;
