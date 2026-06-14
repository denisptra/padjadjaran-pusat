/*
  Warnings:

  - You are about to drop the `CmsArticle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CmsGallery` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CmsGuruBesar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CmsHeroSlider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CmsNews` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('BERITA', 'ARTIKEL');

-- DropTable
DROP TABLE "CmsArticle";

-- DropTable
DROP TABLE "CmsGallery";

-- DropTable
DROP TABLE "CmsGuruBesar";

-- DropTable
DROP TABLE "CmsHeroSlider";

-- DropTable
DROP TABLE "CmsNews";

-- CreateTable
CREATE TABLE "CmsPublication" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "PublicationType" NOT NULL DEFAULT 'BERITA',
    "category" TEXT NOT NULL DEFAULT 'umum',
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPublication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsPublication_slug_key" ON "CmsPublication"("slug");
