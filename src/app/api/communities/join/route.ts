import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncTowerCommunitiesForUser } from "@/lib/tower-communities";
import { createNotification } from "@/lib/notifications";
import { getCommunityLeaderUserIds } from "@/lib/community-leaders";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { communityId } = await request.json();

  const community = await db.subCommunity.findUnique({
    where: { id: communityId },
    select: { id: true, targetBlock: true, name: true },
  });

  if (!community) {
    return NextResponse.json({ error: "Community not found" }, { status: 404 });
  }

  const existing = await db.communityMembership.findUnique({
    where: { userId_subCommunityId: { userId: session.user.id, subCommunityId: communityId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
  }

  if (community.targetBlock) {
    await syncTowerCommunitiesForUser(session.user.id);
    const membership = await db.communityMembership.findUnique({
      where: {
        userId_subCommunityId: { userId: session.user.id, subCommunityId: communityId },
      },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "Only residents of this tower can join this community" },
        { status: 403 },
      );
    }
    return NextResponse.json({ success: true });
  }

  const pendingRequest = await db.communityJoinRequest.findFirst({
    where: {
      userId: session.user.id,
      subCommunityId: communityId,
      status: "PENDING",
    },
  });

  if (pendingRequest) {
    return NextResponse.json({ error: "Request already pending" }, { status: 400 });
  }

  await db.communityJoinRequest.create({
    data: {
      userId: session.user.id,
      subCommunityId: communityId,
      status: "PENDING",
    },
  });

  const requester = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  const leaderIds = await getCommunityLeaderUserIds(communityId);
  await Promise.all(
    leaderIds.map((leaderId) =>
      createNotification(
        leaderId,
        "GENERAL",
        `Join request — ${community.name}`,
        `${requester?.name ?? "A resident"} requested to join ${community.name}.`,
        `/communities/${communityId}`,
      ),
    ),
  );

  return NextResponse.json({ success: true });
}
