/*
  Warnings:

  - A unique constraint covering the columns `[driveId]` on the table `Blog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `blog` ADD COLUMN `driveId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Blog_driveId_key` ON `Blog`(`driveId`);
