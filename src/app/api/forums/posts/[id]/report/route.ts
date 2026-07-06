import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function sanitize(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

const DAILY_REPORT_LIMIT = 5;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reason } = await request.json();

  if (!reason) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  const post = await db.forumPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.authorId === session.user.id) {
    return NextResponse.json({ error: "Cannot report your own post" }, { status: 400 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayReports = await db.forumReport.count({
    where: {
      reporterId: session.user.id,
      createdAt: { gte: todayStart },
    },
  });

  if (todayReports >= DAILY_REPORT_LIMIT) {
    return NextResponse.json(
      { error: `Report limit of ${DAILY_REPORT_LIMIT} per day reached` },
      { status: 429 },
    );
  }

  const existingReport = await db.forumReport.findFirst({
    where: {
      postId: id,
      reporterId: session.user.id,
      status: "OPEN",
    },
  });

  if (existingReport) {
    return NextResponse.json({ error: "You have already reported this post" }, { status: 409 });
  }

  const report = await db.forumReport.create({
    data: {
      postId: id,
      reporterId: session.user.id,
      reason: sanitize(reason),
    },
  });

  return NextResponse.json({ success: true, id: report.id });
}
