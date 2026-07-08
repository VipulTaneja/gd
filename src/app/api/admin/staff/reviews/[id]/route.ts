import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { isAdmin } from "@/lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { isHidden } = await request.json();

  await db.staffReview.update({
    where: { id },
    data: { isHidden: !!isHidden },
  });

  await logAction(session.user.id, isHidden ? "STAFF_REVIEW_HIDDEN" : "STAFF_REVIEW_UNHIDDEN", "StaffReview", id);

  return NextResponse.json({ success: true });
}
