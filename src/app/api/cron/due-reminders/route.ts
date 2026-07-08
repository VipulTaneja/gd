import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/cron-auth";
import { db } from "@/lib/db";

async function markDueReminders() {
  const overdue = await db.due.updateMany({
    where: { status: "PENDING", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });

  return NextResponse.json({ success: true, markedOverdue: overdue.count });
}

export const GET = withCronAuth(markDueReminders);
export const POST = withCronAuth(markDueReminders);
