import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { createBulkNotifications } from "@/lib/notifications";
import { richTextToPlain, sanitizeRichText } from "@/lib/rich-text";
import {
  buildSubCommunityContentFilter,
  canCreateGlobalEventOrPoll,
  canCreateScopedEventOrPoll,
  getCommunityMemberUserIds,
} from "@/lib/community-leaders";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") || "active";
  const now = new Date();

  const tabWhere =
    tab === "closed"
      ? { closesAt: { lt: now } }
      : tab === "upcoming"
        ? { opensAt: { gt: now } }
        : { opensAt: { lte: now }, closesAt: { gte: now } };

  const scopeFilter = await buildSubCommunityContentFilter(session.user.id);

  const polls = await db.poll.findMany({
    where: {
      ...scopeFilter,
      ...tabWhere,
    },
    include: {
      options: { include: { _count: { select: { votes: true } } } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(polls);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await request.json();
  const {
    title, description, options, opensAt, closesAt, scope, subCommunityId,
    isAnonymous, resultVisibility, maxChoices, eligibility, isResolution, quorumPercentage,
  } = body;

  if (!title || !options || options.length < 2 || !opensAt || !closesAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const pollScope = scope || "GLOBAL";

  if (pollScope === "SUB_COMMUNITY") {
    if (!subCommunityId) {
      return NextResponse.json({ error: "subCommunityId required for community polls" }, { status: 400 });
    }
    const community = await db.subCommunity.findUnique({
      where: { id: subCommunityId },
      select: { id: true, isArchived: true },
    });
    if (!community || community.isArchived) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    if (!(await canCreateScopedEventOrPoll(userId, subCommunityId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (!(await canCreateGlobalEventOrPoll(userId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sanitizedDescription =
    typeof description === "string" && description.trim()
      ? sanitizeRichText(description)
      : null;

  const poll = await db.poll.create({
    data: {
      title,
      description: sanitizedDescription,
      scope: pollScope,
      subCommunityId: pollScope === "SUB_COMMUNITY" ? subCommunityId : null,
      isAnonymous: isAnonymous || false,
      resultVisibility: resultVisibility || "LIVE",
      maxChoices: maxChoices || 1,
      eligibility: eligibility || "ALL_RESIDENTS",
      isResolution: isResolution || false,
      quorumPercentage: quorumPercentage || null,
      opensAt: new Date(opensAt),
      closesAt: new Date(closesAt),
      createdById: userId,
      options: {
        create: options.map((label: string, i: number) => ({ label, order: i })),
      },
    },
  });

  await logAction(userId, "POLL_CREATED", "Poll", poll.id, { title, scope: pollScope, subCommunityId });

  const recipientIds =
    pollScope === "SUB_COMMUNITY" && subCommunityId
      ? await getCommunityMemberUserIds(subCommunityId)
      : (
          await db.user.findMany({
            where: { isActive: true, approvalStatus: "APPROVED" },
            select: { id: true },
          })
        ).map((r) => r.id);

  await createBulkNotifications(
    recipientIds,
    "NEW_POLL",
    `New poll: ${title}`,
    sanitizedDescription ? richTextToPlain(sanitizedDescription) : undefined,
    `/polls/${poll.id}`,
  );

  return NextResponse.json({ success: true, id: poll.id });
}
