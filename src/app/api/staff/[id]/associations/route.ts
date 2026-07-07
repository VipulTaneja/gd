import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  canManageStaffAssociation,
  requireApprovedResident,
  isResidentStaffRole,
} from "@/lib/staff-auth";
import { addStaffAssociation, endStaffAssociation } from "@/lib/staff";
import type { StaffRole } from "@/generated/prisma/enums";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const { id: staffPersonId } = await params;
  const body = await request.json();
  const { unitId, role, recurrenceDays, startDate } = body;

  if (!unitId || !role) {
    return NextResponse.json({ error: "unitId and role required" }, { status: 400 });
  }

  if (!isResidentStaffRole(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 403 });
  }

  const canManage = await canManageStaffAssociation(session.user.id, unitId);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const person = await db.staffPerson.findUnique({ where: { id: staffPersonId } });
  if (!person) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  try {
    const association = await addStaffAssociation({
      staffPersonId,
      unitId,
      role: role as StaffRole,
      recurrenceDays: recurrenceDays ?? ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
      registeredById: session.user.id,
      startDate: startDate ? new Date(startDate) : undefined,
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "STAFF_ASSOCIATION_CREATED",
        entityType: "StaffAssociation",
        entityId: association.id,
        metadata: { staffPersonId, unitId, role },
      },
    });

    return NextResponse.json({ success: true, associationId: association.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const { id: staffPersonId } = await params;
  const { associationId } = await request.json();

  if (!associationId) {
    return NextResponse.json({ error: "associationId required" }, { status: 400 });
  }

  const association = await db.staffAssociation.findFirst({
    where: { id: associationId, staffPersonId },
  });
  if (!association || !association.unitId) {
    return NextResponse.json({ error: "Association not found" }, { status: 404 });
  }

  const canManage = await canManageStaffAssociation(session.user.id, association.unitId);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await endStaffAssociation(associationId);

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "STAFF_ASSOCIATION_ENDED",
      entityType: "StaffAssociation",
      entityId: associationId,
      metadata: { staffPersonId },
    },
  });

  return NextResponse.json({ success: true });
}
