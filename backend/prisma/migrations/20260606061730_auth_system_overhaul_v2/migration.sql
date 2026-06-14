/*
  Warnings:

  - You are about to drop the column `type` on the `OtpToken` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - Added the required column `email` to the `OtpToken` table without a default value. This is not possible if the table is not empty.

*/

-- Delete existing tokens as they lack the 'email' field and purpose has changed
DELETE FROM "OtpToken";
DELETE FROM "RefreshToken";
DELETE FROM "PasswordResetToken";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "OtpToken" DROP COLUMN "type",
ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "purpose" TEXT NOT NULL DEFAULT 'email_verify';

-- AlterTable
-- First add status column
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'PENDING';
-- Update status based on isActive
UPDATE "User" SET "status" = 'ACTIVE' WHERE "isActive" = true;
-- Drop isActive
ALTER TABLE "User" DROP COLUMN "isActive",
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "OtpToken_email_purpose_idx" ON "OtpToken"("email", "purpose");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
