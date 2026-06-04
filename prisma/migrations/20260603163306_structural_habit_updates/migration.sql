/*
  Warnings:

  - You are about to drop the column `completedAt` on the `HabitLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[habitId,date]` on the table `HabitLog` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `HabitLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "customCount" INTEGER;

-- AlterTable
ALTER TABLE "HabitLog" DROP COLUMN "completedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");
