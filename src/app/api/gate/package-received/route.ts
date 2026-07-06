import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { passId, unitNumber } = await request.json();

  if (!passId || !unitNumber) {
    return NextResponse.json({ error: "Pass ID and unit number are required" }, { status: 400 });
  }

  const pass = await db.visitorPass.findUnique({
    where: { id: passId },
    include: { user: true, unit: true },
  });

  if (!pass || pass.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid or inactive pass" }, { status: 400 });
  }

  await db.visitorPass.update({
    where: { id: passId },
    data: { status: "USED", usedAt: new Date() },
  });

  await createNotification(
    pass.userId,
    "VISITOR_ARRIVED",
    `Package received for ${pass.unit.unitNumber}`,
    `A package has been received for your unit from ${pass.visitorName}. Please collect from the gate.`,
    "/visitors"
  );

  return NextResponse.json({ success: true });
}
