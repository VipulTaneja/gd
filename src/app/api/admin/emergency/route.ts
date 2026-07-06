import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBulkNotifications } from "@/lib/notifications";
import { richTextToPlain, validateRichTextBody } from "@/lib/rich-text";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, body } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
  }

  const parsedBody = validateRichTextBody(body);
  if (!parsedBody.ok) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }

  const notice = await db.notice.create({
    data: {
      title,
      body: parsedBody.html,
      priority: "EMERGENCY",
      createdById: session.user.id,
    },
  });

  const residents = await db.user.findMany({
    where: { isActive: true, approvalStatus: "APPROVED" },
    select: { id: true },
  });

  await createBulkNotifications(
    residents.map((r) => r.id),
    "NOTICE_PUBLISHED",
    `EMERGENCY: ${title}`,
    richTextToPlain(parsedBody.html),
    `/notices`
  );

  return NextResponse.json({ success: true, id: notice.id, notified: residents.length });
}
