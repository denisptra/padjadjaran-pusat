-- CreateEnum
CREATE TYPE "AnnouncementScope" AS ENUM ('national', 'province', 'region');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "scope" "AnnouncementScope" NOT NULL DEFAULT 'national',
ADD COLUMN     "targetProvinces" TEXT[],
ADD COLUMN     "targetRegions" TEXT[];
