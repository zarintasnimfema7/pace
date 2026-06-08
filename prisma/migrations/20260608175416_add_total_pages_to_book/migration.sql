/*
  Warnings:

  - You are about to drop the column `pages` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "pages",
ADD COLUMN     "totalPages" INTEGER NOT NULL DEFAULT 0;
