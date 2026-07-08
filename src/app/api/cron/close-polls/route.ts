import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/cron-auth";
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

export const GET = withCronAuth(closePolls);
export const POST = withCronAuth(closePolls);
