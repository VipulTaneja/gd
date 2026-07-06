import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pollId, optionIds } = await request.json();
  const userId = session.user!.id;

  const poll = await db.poll.findUnique({ where: { id: pollId } });
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

  const now = new Date();
  if (poll.opensAt > now || poll.closesAt < now) {
    return NextResponse.json({ error: "Poll is not active" }, { status: 400 });
  }

  const existingVotes = await db.vote.findMany({ where: { pollId, userId } });
  if (existingVotes.length > 0) {
    return NextResponse.json({ error: "Already voted" }, { status: 400 });
  }

  if (optionIds.length > poll.maxChoices) {
    return NextResponse.json({ error: `Max ${poll.maxChoices} choices allowed` }, { status: 400 });
  }

  if (poll.eligibility !== "ALL_RESIDENTS") {
    if (poll.scope === "SUB_COMMUNITY" && poll.subCommunityId) {
      const communityMember = await db.communityMembership.findFirst({
        where: { userId, subCommunityId: poll.subCommunityId },
      });
      if (!communityMember) {
        return NextResponse.json({ error: "You are not eligible to vote in this poll" }, { status: 403 });
      }
    }

    const userMembership = await db.unitMembership.findFirst({
      where: {
        userId,
        endDate: null,
      },
    });

    if (!userMembership) {
      return NextResponse.json({ error: "You are not eligible to vote in this poll" }, { status: 403 });
    }

    if (poll.eligibility === "OWNERS_ONLY" && userMembership.role !== "OWNER" && userMembership.role !== "JOINT_OWNER") {
      return NextResponse.json({ error: "This poll is restricted to owners only" }, { status: 403 });
    }

    if (poll.eligibility === "ONE_PER_UNIT") {
      const existingUnitVote = await db.vote.findFirst({
        where: {
          pollId,
          user: { unitMemberships: { some: { unitId: userMembership.unitId, endDate: null } } },
        },
      });
      if (existingUnitVote) {
        return NextResponse.json({ error: "Someone from your unit has already voted" }, { status: 403 });
      }
    }
  }

  await db.vote.createMany({
    data: optionIds.map((optionId: string) => ({
      pollId,
      optionId,
      userId,
    })),
  });

  return NextResponse.json({ success: true });
}
