import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { createBulkNotifications } from "@/lib/notifications";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, body, priority, targetBlock, expiresAt } = await request.json();

  if (!title || !body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const notice = await db.notice.create({
    data: {
      title,
      body,
      priority: priority || "NORMAL",
      targetBlock: targetBlock || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdById: session.user!.id,
    },
  });

  await logAction(session.user!.id, "NOTICE_CREATED", "Notice", notice.id, { title, priority, targetBlock });

  // Notify residents (filtered by target block if specified)
  const residents = targetBlock
    ? await db.user.findMany({
        where: {
          isActive: true,
          approvalStatus: "APPROVED",
          unitMemberships: { some: { unit: { block: targetBlock } } },
        },
        select: { id: true },
      })
    : await db.user.findMany({
        where: { isActive: true, approvalStatus: "APPROVED" },
        select: { id: true },
      });

  await createBulkNotifications(
    residents.map((r) => r.id),
    "NOTICE_PUBLISHED",
    priority === "EMERGENCY" ? `EMERGENCY: ${title}` : `New notice: ${title}`,
    undefined,
    `/notices`
  );

  return NextResponse.json({ success: true, id: notice.id });
}
