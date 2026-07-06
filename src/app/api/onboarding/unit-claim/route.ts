import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { unitNumber } = await request.json();

  if (!unitNumber || !/^[ABC]-\d{4}$/.test(unitNumber)) {
    return NextResponse.json({ error: "Invalid unit number format" }, { status: 400 });
  }

  try {
    const unit = await db.unit.findUnique({ where: { unitNumber } });
    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        claimedUnitId: unit.id,
        claimStatus: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save claim" }, { status: 500 });
  }
}
