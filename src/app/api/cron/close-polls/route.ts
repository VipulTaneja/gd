import { NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { db } from "@/lib/db";

async function closePolls() {
  const closedPolls = await db.poll.updateMany({
    where: {
      closesAt: { lt: new Date() },
    },
    data: {},
  });

  return NextResponse.json({ success: true, checked: closedPolls.count });
}

export async function GET() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await closePolls();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await closePolls();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
