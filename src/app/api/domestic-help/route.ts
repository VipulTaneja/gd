import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone, helpType, recurrenceDays, unitId } = await request.json();

  if (!name || !unitId) {
    return NextResponse.json({ error: "Name and unit are required" }, { status: 400 });
  }

  const membership = await db.unitMembership.findFirst({
    where: { userId: session.user.id, unitId, endDate: null },
  });
  if (!membership) {
    return NextResponse.json({ error: "You are not a member of this unit" }, { status: 403 });
  }

  const domesticHelp = await db.domesticHelp.create({
    data: {
      userId: session.user.id,
      unitId,
      name,
      phone: phone || null,
      helpType: helpType || "OTHER",
      recurrenceDays: recurrenceDays || [],
      createdById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, id: domesticHelp.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const helps = await db.domesticHelp.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: { unit: { select: { unitNumber: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(helps);
}
