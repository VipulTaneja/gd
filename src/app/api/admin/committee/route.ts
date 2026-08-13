import { NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { parseDesignationTitle } from "@/lib/designation-labels";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const { email, title, startDate, endDate } = await request.json();
  const parsedTitle = parseDesignationTitle(title);
  if (!parsedTitle) {
    return NextResponse.json({ error: "Invalid committee title" }, { status: 400 });
  }

  const parsedStartDate = new Date(startDate);
  if (isNaN(parsedStartDate.getTime())) {
    return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
  }

  let parsedEndDate: Date | null = null;
  if (endDate) {
    parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      return NextResponse.json({ error: "Invalid end date" }, { status: 400 });
    }
    if (parsedEndDate <= parsedStartDate) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 });
    }
  }

  const targetUser = await db.user.findUnique({ where: { email } });
  if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Avoid stacking identical open designations (seed / double-submit).
  if (!parsedEndDate) {
    const openExisting = await db.designation.findFirst({
      where: {
        userId: targetUser.id,
        title: parsedTitle,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      select: { id: true },
    });
    if (openExisting) {
      return NextResponse.json(
        { error: "This user already has an active designation with that title" },
        { status: 409 },
      );
    }
  }

  const designation = await db.designation.create({
    data: {
      userId: targetUser.id,
      title: parsedTitle,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    },
  });

  await logAction(admin.userId, "DESIGNATION_CREATED", "Designation", designation.id, {
    email,
    title: parsedTitle,
  });

  return NextResponse.json({ success: true });
}
