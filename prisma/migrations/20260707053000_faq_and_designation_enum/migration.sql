-- CreateEnum
CREATE TYPE "DesignationTitle" AS ENUM ('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'TREASURER', 'COMMITTEE_MEMBER');

-- AlterTable: Designation.title String -> DesignationTitle
ALTER TABLE "Designation" ADD COLUMN "title_new" "DesignationTitle";

UPDATE "Designation" SET "title_new" = CASE
  WHEN LOWER(TRIM("title")) IN ('president') THEN 'PRESIDENT'::"DesignationTitle"
  WHEN LOWER(TRIM("title")) IN ('vice president', 'vice-president') THEN 'VICE_PRESIDENT'::"DesignationTitle"
  WHEN LOWER(TRIM("title")) IN ('secretary') THEN 'SECRETARY'::"DesignationTitle"
  WHEN LOWER(TRIM("title")) IN ('treasurer') THEN 'TREASURER'::"DesignationTitle"
  ELSE 'COMMITTEE_MEMBER'::"DesignationTitle"
END;

ALTER TABLE "Designation" DROP COLUMN "title";
ALTER TABLE "Designation" RENAME COLUMN "title_new" TO "title";
ALTER TABLE "Designation" ALTER COLUMN "title" SET NOT NULL;

-- CreateTable
CREATE TABLE "FaqSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "lastEditedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "lastEditedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FaqSection_slug_key" ON "FaqSection"("slug");
CREATE INDEX "FaqSection_isPublished_sortOrder_idx" ON "FaqSection"("isPublished", "sortOrder");
CREATE UNIQUE INDEX "FaqItem_sectionId_slug_key" ON "FaqItem"("sectionId", "slug");
CREATE INDEX "FaqItem_sectionId_isPublished_sortOrder_idx" ON "FaqItem"("sectionId", "isPublished", "sortOrder");

ALTER TABLE "FaqSection" ADD CONSTRAINT "FaqSection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FaqSection" ADD CONSTRAINT "FaqSection_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FaqSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FaqItem" ADD CONSTRAINT "FaqItem_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
