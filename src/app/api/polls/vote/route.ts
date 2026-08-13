import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { pollId?: unknown; optionIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const pollId = typeof body.pollId === "string" ? body.pollId : null;
  const optionIds = Array.isArray(body.optionIds)
    ? body.optionIds.filter((id): id is string => typeof id === "string")
    : null;

  if (!pollId || !optionIds || optionIds.length === 0) {
    return NextResponse.json({ error: "pollId and optionIds are required" }, { status: 400 });
  }

  const userId = session.user.id;

  try {
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      select: {
        id: true,
        opensAt: true,
        closesAt: true,
        maxChoices: true,
        eligibility: true,
        scope: true,
        subCommunityId: true,
        options: { select: { id: true } },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    const now = new Date();
    if (poll.opensAt > now || poll.closesAt < now) {
      return NextResponse.json({ error: "Poll is not active" }, { status: 400 });
    }

    const existingVotes = await db.vote.findMany({ where: { pollId, userId }, select: { id: true } });
    if (existingVotes.length > 0) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 });
    }

    if (optionIds.length > poll.maxChoices) {
      return NextResponse.json(
        { error: `Max ${poll.maxChoices} choices allowed` },
        { status: 400 },
      );
    }

    const validOptionIds = new Set(poll.options.map((o) => o.id));
    if (optionIds.some((id) => !validOptionIds.has(id))) {
      return NextResponse.json({ error: "Invalid poll option" }, { status: 400 });
    }

    if (poll.eligibility !== "ALL_RESIDENTS") {
      if (poll.scope === "SUB_COMMUNITY" && poll.subCommunityId) {
        const communityMember = await db.communityMembership.findFirst({
          where: { userId, subCommunityId: poll.subCommunityId },
          select: { id: true },
        });
        if (!communityMember) {
          return NextResponse.json(
            { error: "You are not eligible to vote in this poll" },
            { status: 403 },
          );
        }
      }

      const userMembership = await db.unitMembership.findFirst({
        where: {
          userId,
          OR: [{ endDate: null }, { endDate: { gt: now } }],
        },
        select: { unitId: true, role: true },
      });

      if (!userMembership) {
        return NextResponse.json(
          { error: "You are not eligible to vote in this poll" },
          { status: 403 },
        );
      }

      if (
        poll.eligibility === "OWNERS_ONLY" &&
        userMembership.role !== "OWNER" &&
        userMembership.role !== "JOINT_OWNER"
      ) {
        return NextResponse.json(
          { error: "This poll is restricted to owners only" },
          { status: 403 },
        );
      }

      if (poll.eligibility === "ONE_PER_UNIT") {
        const existingUnitVote = await db.vote.findFirst({
          where: {
            pollId,
            user: {
              unitMemberships: {
                some: {
                  unitId: userMembership.unitId,
                  OR: [{ endDate: null }, { endDate: { gt: now } }],
                },
              },
            },
          },
          select: { id: true },
        });
        if (existingUnitVote) {
          return NextResponse.json(
            { error: "Someone from your unit has already voted" },
            { status: 403 },
          );
        }
      }
    }

    await db.vote.createMany({
      data: optionIds.map((optionId) => ({
        pollId,
        optionId,
        userId,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Vote submission failed", err);
    return NextResponse.json({ error: "Failed to submit vote" }, { status: 500 });
  }
}
