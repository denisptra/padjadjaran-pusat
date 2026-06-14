/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `MemberProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `MemberProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_nik_key" ON "MemberProfile"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "MemberProfile_phone_key" ON "MemberProfile"("phone");
