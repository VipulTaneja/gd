-- CreateTable
CREATE TABLE "FacilityWaitlist" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacilityWaitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacilityWaitlist_facilityId_status_idx" ON "FacilityWaitlist"("facilityId", "status");

-- AddForeignKey
ALTER TABLE "FacilityWaitlist" ADD CONSTRAINT "FacilityWaitlist_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacilityWaitlist" ADD CONSTRAINT "FacilityWaitlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
