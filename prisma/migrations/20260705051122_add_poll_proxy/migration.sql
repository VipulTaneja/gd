-- CreateTable
CREATE TABLE "PollProxy" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "proxyUserId" TEXT NOT NULL,
    "targetUnitId" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PollProxy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PollProxy_pollId_targetUnitId_key" ON "PollProxy"("pollId", "targetUnitId");

-- AddForeignKey
ALTER TABLE "PollProxy" ADD CONSTRAINT "PollProxy_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollProxy" ADD CONSTRAINT "PollProxy_proxyUserId_fkey" FOREIGN KEY ("proxyUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PollProxy" ADD CONSTRAINT "PollProxy_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
