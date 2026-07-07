-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('MAID', 'NANNY', 'COOK', 'DRIVER', 'GARDENER', 'GUARD', 'FACILITY', 'ELECTRICIAN', 'PLUMBER', 'OTHER');

-- CreateEnum
CREATE TYPE "StaffScope" AS ENUM ('UNIT', 'SOCIETY');

-- CreateEnum
CREATE TYPE "StaffAssociationStatus" AS ENUM ('ACTIVE', 'ENDED', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "VisitorPass" DROP CONSTRAINT "VisitorPass_unitId_fkey";

-- AlterTable
ALTER TABLE "ImportantContact" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "VisitorPass" ADD COLUMN     "staffPersonId" TEXT,
ALTER COLUMN "unitId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "StaffPerson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAssociation" (
    "id" TEXT NOT NULL,
    "staffPersonId" TEXT NOT NULL,
    "scope" "StaffScope" NOT NULL,
    "unitId" TEXT,
    "role" "StaffRole" NOT NULL,
    "recurrenceDays" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "StaffAssociationStatus" NOT NULL DEFAULT 'ACTIVE',
    "registeredById" TEXT NOT NULL,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffReview" (
    "id" TEXT NOT NULL,
    "staffPersonId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactReview" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPerson_phone_key" ON "StaffPerson"("phone");

-- CreateIndex
CREATE INDEX "StaffPerson_name_idx" ON "StaffPerson"("name");

-- CreateIndex
CREATE INDEX "StaffAssociation_staffPersonId_status_idx" ON "StaffAssociation"("staffPersonId", "status");

-- CreateIndex
CREATE INDEX "StaffAssociation_unitId_status_idx" ON "StaffAssociation"("unitId", "status");

-- CreateIndex
CREATE INDEX "StaffReview_staffPersonId_isHidden_idx" ON "StaffReview"("staffPersonId", "isHidden");

-- CreateIndex
CREATE UNIQUE INDEX "StaffReview_staffPersonId_authorId_key" ON "StaffReview"("staffPersonId", "authorId");

-- CreateIndex
CREATE INDEX "ContactReview_contactId_isHidden_idx" ON "ContactReview"("contactId", "isHidden");

-- CreateIndex
CREATE UNIQUE INDEX "ContactReview_contactId_authorId_key" ON "ContactReview"("contactId", "authorId");

-- CreateIndex
CREATE INDEX "VisitorPass_staffPersonId_status_idx" ON "VisitorPass"("staffPersonId", "status");

-- AddForeignKey
ALTER TABLE "StaffAssociation" ADD CONSTRAINT "StaffAssociation_staffPersonId_fkey" FOREIGN KEY ("staffPersonId") REFERENCES "StaffPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssociation" ADD CONSTRAINT "StaffAssociation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssociation" ADD CONSTRAINT "StaffAssociation_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffReview" ADD CONSTRAINT "StaffReview_staffPersonId_fkey" FOREIGN KEY ("staffPersonId") REFERENCES "StaffPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffReview" ADD CONSTRAINT "StaffReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorPass" ADD CONSTRAINT "VisitorPass_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorPass" ADD CONSTRAINT "VisitorPass_staffPersonId_fkey" FOREIGN KEY ("staffPersonId") REFERENCES "StaffPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportantContact" ADD CONSTRAINT "ImportantContact_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactReview" ADD CONSTRAINT "ContactReview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "ImportantContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactReview" ADD CONSTRAINT "ContactReview_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
