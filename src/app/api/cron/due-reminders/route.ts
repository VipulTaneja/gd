import { NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { db } from "@/lib/db";

async function markDueReminders() {
  const overdue = await db.due.updateMany({
    where: { status: "PENDING", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });

  return NextResponse.json({ success: true, markedOverdue: overdue.count });
}

export async function GET() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await markDueReminders();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await markDueReminders();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
