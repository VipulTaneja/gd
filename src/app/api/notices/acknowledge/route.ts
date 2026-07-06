import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noticeId } = await request.json();

  if (!noticeId) {
    return NextResponse.json({ error: "Notice ID is required" }, { status: 400 });
  }

  const notice = await db.notice.findUnique({ where: { id: noticeId } });
  if (!notice || notice.priority !== "EMERGENCY") {
    return NextResponse.json({ error: "Only emergency notices require acknowledgment" }, { status: 400 });
  }

  const existing = await db.noticeAcknowledgment.findUnique({
    where: { noticeId_userId: { noticeId, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ success: true, message: "Already acknowledged" });
  }

  await db.noticeAcknowledgment.create({
    data: {
      noticeId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
