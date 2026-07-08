import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/cron-auth";
import { db } from "@/lib/db";

async function expirePasses() {
  const expired = await db.visitorPass.updateMany({
    where: {
      status: "ACTIVE",
      validUntil: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({ success: true, expired: expired.count });
}

export const GET = withCronAuth(expirePasses);
export const POST = withCronAuth(expirePasses);
