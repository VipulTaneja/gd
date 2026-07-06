import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { createBulkNotifications } from "@/lib/notifications";
import { validateRichTextBody } from "@/lib/rich-text";
import { isAdmin } from "@/lib/rbac";
import {
  buildNoticeVisibilityFilter,
  canCreateGlobalNotice,
  canCreateScopedNotice,
  getCommunityMemberUserIds,
} from "@/lib/community-leaders";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = await buildNoticeVisibilityFilter(session.user.id);

  const notices = await db.notice.findMany({
    where,
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
    select: {
      id: true,
      title: true,
      body: true,
      priority: true,
      targetBlock: true,
      subCommunityId: true,
      publishedAt: true,
      expiresAt: true,
    },
  });

  return NextResponse.json(notices);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { title, body, priority, targetBlock, subCommunityId, expiresAt } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const noticePriority = priority || "NORMAL";

  if (subCommunityId) {
    const community = await db.subCommunity.findUnique({
      where: { id: subCommunityId },
      select: { id: true, isArchived: true },
    });
    if (!community || community.isArchived) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }
    if (!(await canCreateScopedNotice(userId, subCommunityId, noticePriority))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (targetBlock) {
      return NextResponse.json({ error: "Tower-scoped notices require admin access" }, { status: 403 });
    }
  } else {
    if (!(await canCreateGlobalNotice(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (noticePriority === "EMERGENCY" && !(await isAdmin(userId))) {
      return NextResponse.json({ error: "Emergency notices require admin access" }, { status: 403 });
    }
  }

  const parsedBody = validateRichTextBody(body);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }

  const notice = await db.notice.create({
    data: {
      title,
      body: parsedBody.html,
      priority: noticePriority,
      targetBlock: targetBlock || null,
      subCommunityId: subCommunityId || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById: userId,
    },
  });

  await logAction(userId, "NOTICE_CREATED", "Notice", notice.id, {
    title,
    priority: noticePriority,
    targetBlock,
    subCommunityId,
  });

  const recipientIds = subCommunityId
    ? await getCommunityMemberUserIds(subCommunityId)
    : targetBlock
      ? (
          await db.user.findMany({
            where: {
              isActive: true,
              approvalStatus: "APPROVED",
              unitMemberships: {
                some: {
                  unit: { block: targetBlock },
                  OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
                },
              },
            },
            select: { id: true },
          })
        ).map((r) => r.id)
      : (
          await db.user.findMany({
            where: { isActive: true, approvalStatus: "APPROVED" },
            select: { id: true },
          })
        ).map((r) => r.id);

  await createBulkNotifications(
    recipientIds,
    "NOTICE_PUBLISHED",
    noticePriority === "EMERGENCY" ? `EMERGENCY: ${title}` : `New notice: ${title}`,
    undefined,
    `/notices`,
  );

  return NextResponse.json({ success: true, id: notice.id });
}
