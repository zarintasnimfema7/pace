/*
  Warnings:

  - You are about to drop the column `isCompleted` on the `Book` table. All the data in the column will be lost.
  - Added the required column `month` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('WANT_TO_READ', 'COMPLETED');

-- CreateEnum
CREATE TYPE "FocusStatus" AS ENUM ('SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "isCompleted",
ADD COLUMN     "month" TEXT NOT NULL,
ADD COLUMN     "status" "BookStatus" NOT NULL DEFAULT 'WANT_TO_READ',
ADD COLUMN     "year" INTEGER NOT NULL,
ALTER COLUMN "author" DROP NOT NULL;

-- CreateTable
CREATE TABLE "FocusSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "FocusStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FocusSession_userId_idx" ON "FocusSession"("userId");

-- CreateIndex
CREATE INDEX "FocusSession_createdAt_idx" ON "FocusSession"("createdAt");

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
