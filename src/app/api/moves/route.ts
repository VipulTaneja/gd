import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, unitId, notes } = await request.json();

  if (!type || !unitId) {
    return NextResponse.json({ error: "Type and unit are required" }, { status: 400 });
  }

  const membership = await db.unitMembership.findFirst({
    where: { userId: session.user.id, unitId, endDate: null, role: { in: ["OWNER", "JOINT_OWNER"] } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Only owners can submit move requests" }, { status: 403 });
  }

  const existingPending = await db.moveRequest.findFirst({
    where: { unitId, status: "PENDING" },
  });

  if (existingPending) {
    return NextResponse.json({ error: "There is already a pending move request for this unit" }, { status: 400 });
  }

  const moveRequest = await db.moveRequest.create({
    data: {
      type,
      unitId,
      requestedBy: session.user.id,
      notes: notes || null,
    },
  });

  return NextResponse.json({ success: true, id: moveRequest.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(
    (session.user as any)?.globalRole ?? ""
  );

  const where = isAdmin ? {} : { requestedBy: session.user.id };

  const moves = await db.moveRequest.findMany({
    where,
    include: {
      unit: { select: { unitNumber: true, block: true } },
      requester: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(moves);
}
