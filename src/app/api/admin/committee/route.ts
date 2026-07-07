import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { parseDesignationTitle } from "@/lib/designation-labels";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, title, startDate, endDate } = await request.json();
  const parsedTitle = parseDesignationTitle(title);
  if (!parsedTitle) {
    return NextResponse.json({ error: "Invalid committee title" }, { status: 400 });
  }

  const targetUser = await db.user.findUnique({ where: { email } });
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const designation = await db.designation.create({
    data: {
      userId: targetUser.id,
      title: parsedTitle,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  await logAction(user.id, "DESIGNATION_CREATED", "Designation", designation.id, {
    email,
    title: parsedTitle,
  });

  return NextResponse.json({ success: true });
}
