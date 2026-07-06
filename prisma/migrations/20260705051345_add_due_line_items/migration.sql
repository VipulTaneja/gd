-- CreateTable
CREATE TABLE "DueLineItem" (
    "id" TEXT NOT NULL,
    "dueId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "DueLineItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DueLineItem" ADD CONSTRAINT "DueLineItem_dueId_fkey" FOREIGN KEY ("dueId") REFERENCES "Due"("id") ON DELETE CASCADE ON UPDATE CASCADE;
