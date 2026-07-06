import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { communityId } = await request.json();

  const existing = await db.communityMembership.findUnique({
    where: { userId_subCommunityId: { userId: session.user.id, subCommunityId: communityId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 400 });
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

  return NextResponse.json({ success: true });
}
