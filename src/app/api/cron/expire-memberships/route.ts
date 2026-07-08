import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/cron-auth";
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

export const GET = withCronAuth(expireMemberships);
export const POST = withCronAuth(expireMemberships);
