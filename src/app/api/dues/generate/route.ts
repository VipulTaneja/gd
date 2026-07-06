import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user!.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  await logAction(session.user!.id, "DUES_GENERATED", "Due", "bulk", {
    label,
    amount,
    count: units.length,
  });

  return NextResponse.json({ success: true, count: units.length });
}
