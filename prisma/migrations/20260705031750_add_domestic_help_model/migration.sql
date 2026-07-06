-- CreateEnum
CREATE TYPE "DomesticHelpStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateTable
CREATE TABLE "DomesticHelp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "helpType" TEXT NOT NULL DEFAULT 'OTHER',
    "recurrenceDays" TEXT[],
    "status" "DomesticHelpStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomesticHelp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DomesticHelp_unitId_status_idx" ON "DomesticHelp"("unitId", "status");

-- CreateIndex
CREATE INDEX "DomesticHelp_userId_status_idx" ON "DomesticHelp"("userId", "status");

-- AddForeignKey
ALTER TABLE "DomesticHelp" ADD CONSTRAINT "DomesticHelp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomesticHelp" ADD CONSTRAINT "DomesticHelp_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomesticHelp" ADD CONSTRAINT "DomesticHelp_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
