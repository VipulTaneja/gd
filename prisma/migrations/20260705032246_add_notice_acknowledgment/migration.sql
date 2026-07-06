-- CreateTable
CREATE TABLE "NoticeAcknowledgment" (
    "id" TEXT NOT NULL,
    "noticeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ackAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoticeAcknowledgment_noticeId_userId_key" ON "NoticeAcknowledgment"("noticeId", "userId");

-- AddForeignKey
ALTER TABLE "NoticeAcknowledgment" ADD CONSTRAINT "NoticeAcknowledgment_noticeId_fkey" FOREIGN KEY ("noticeId") REFERENCES "Notice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
