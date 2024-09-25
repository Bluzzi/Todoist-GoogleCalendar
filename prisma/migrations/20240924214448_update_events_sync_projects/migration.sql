/*
  Warnings:

  - A unique constraint covering the columns `[priority]` on the table `EventsSyncProjects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `priority` to the `EventsSyncProjects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventsSyncProjects" ADD COLUMN     "calendarName" TEXT,
ADD COLUMN     "eventTitles" TEXT[],
ADD COLUMN     "priority" INTEGER NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventsSyncProjects_priority_key" ON "EventsSyncProjects"("priority");
