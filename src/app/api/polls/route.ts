import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { createBulkNotifications } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    title, description, options, opensAt, closesAt, scope, subCommunityId,
    isAnonymous, resultVisibility, maxChoices, eligibility, isResolution, quorumPercentage,
  } = body;

  if (!title || !options || options.length < 2 || !opensAt || !closesAt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const poll = await db.poll.create({
    data: {
      title,
      description,
      scope: scope || "GLOBAL",
      subCommunityId: subCommunityId || null,
      isAnonymous: isAnonymous || false,
      resultVisibility: resultVisibility || "LIVE",
      maxChoices: maxChoices || 1,
      eligibility: eligibility || "ALL_RESIDENTS",
      isResolution: isResolution || false,
      quorumPercentage: quorumPercentage || null,
      opensAt: new Date(opensAt),
      closesAt: new Date(closesAt),
      createdById: session.user.id,
      options: {
        create: options.map((label: string, i: number) => ({ label, order: i })),
      },
    },
  });

  await logAction(session.user.id, "POLL_CREATED", "Poll", poll.id, { title, scope });

  // Notify all approved residents
  const residents = await db.user.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    select: { id: true },
  });
  await createBulkNotifications(
    residents.map((r) => r.id),
    "NEW_POLL",
    `New poll: ${title}`,
    description || undefined,
    `/polls/${poll.id}`
  );

  return NextResponse.json({ success: true, id: poll.id });
}
