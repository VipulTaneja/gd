import { NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
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

export async function GET() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await expirePasses();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await expirePasses();
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
