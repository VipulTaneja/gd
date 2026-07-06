import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UnitRole } from "@/generated/prisma/enums";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await db.user.findUnique({ where: { id: session.user.id } });
  if (!admin || !["SUPER_ADMIN", "ADMIN"].includes(admin.globalRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { membershipId, role, isPrimary, endDate } = await request.json();

  if (!membershipId || !role) {
    return NextResponse.json({ error: "Membership ID and role are required" }, { status: 400 });
  }

  try {
    const membership = await db.unitMembership.findUnique({
      where: { id: membershipId },
    });

    if (!membership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // If setting as primary, unset other primary memberships in this unit
    if (isPrimary && !membership.isPrimary) {
      await db.unitMembership.updateMany({
        where: {
          unitId: membership.unitId,
          isPrimary: true,
          id: { not: membershipId },
        },
        data: { isPrimary: false },
      });
    }

    await db.unitMembership.update({
      where: { id: membershipId },
      data: {
        role: role as UnitRole,
        isPrimary,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    await db.auditLog.create({
      data: {
        userId: admin.id,
        action: "MEMBERSHIP_UPDATED",
        entityType: "UnitMembership",
        entityId: membershipId,
        metadata: { role, isPrimary, endDate },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update membership" },
      { status: 500 }
    );
  }
}
