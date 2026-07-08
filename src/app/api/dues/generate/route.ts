import { NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const { label, amount, dueDate } = await request.json();

  if (!label || !amount || !dueDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const units = await db.unit.findMany({ select: { id: true } });

  await db.$transaction(
    units.map((unit) =>
      db.due.create({
        data: {
          unitId: unit.id,
          label,
          amount,
          dueDate: new Date(dueDate),
        },
      })
    )
  );

  await logAction(admin.userId, "DUES_GENERATED", "Due", "bulk", {
    label,
    amount,
    count: units.length,
  });

  return NextResponse.json({ success: true, count: units.length });
}
