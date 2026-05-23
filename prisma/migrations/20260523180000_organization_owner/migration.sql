-- CreateEnum addition handled via ALTER TYPE
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OWNER';

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "inviteCode" TEXT,
ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_ownerId_key" ON "Organization"("ownerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Restaurant_inviteCode_key" ON "Restaurant"("inviteCode");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
