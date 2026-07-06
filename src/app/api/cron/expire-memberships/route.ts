import { NextResponse } from "next/server";
import { authorizeCronRequest } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { syncAllTowerCommunities } from "@/lib/tower-communities";

async function expireMemberships() {
  const expiredMemberships = await db.unitMembership.updateMany({
    where: {
      endDate: { not: null, lt: new Date() },
    },
    data: {
      endDate: new Date(),
    },
  });

  const towerSync = await syncAllTowerCommunities();

  return NextResponse.json({
    success: true,
    expired: expiredMemberships.count,
    towerCommunitiesSynced: towerSync.length,
  });
}

export async function GET() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await expireMemberships();
  } catch {
    return NextResponse.json({ error: "Failed to expire memberships" }, { status: 500 });
  }
}

export async function POST() {
  if (!(await authorizeCronRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await expireMemberships();
  } catch {
    return NextResponse.json({ error: "Failed to expire memberships" }, { status: 500 });
  }
}
