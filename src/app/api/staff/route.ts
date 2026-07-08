import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  canManageStaffAssociation,
  requireApprovedResident,
  isResidentStaffRole,
} from "@/lib/staff-auth";
import {
  createStaffWithAssociation,
  getStaffListForCaller,
} from "@/lib/staff";
import type { StaffRole } from "@/generated/prisma/enums";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const { staff, callerUnitIds } = await getStaffListForCaller(session.user.id);

  return NextResponse.json({ staff, callerUnitIds });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approved = await requireApprovedResident(session.user.id);
  if (!approved) {
    return NextResponse.json({ error: "Approval required" }, { status: 403 });
  }

  const body = await request.json();
  const { name, phone, role, unitId, recurrenceDays, startDate } = body;

  if (!name || !phone || !role || !unitId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!isResidentStaffRole(role)) {
    return NextResponse.json({ error: "Invalid role for resident association" }, { status: 400 });
  }

  const canManage = await canManageStaffAssociation(session.user.id, unitId);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { person, association } = await createStaffWithAssociation({
      name,
      phone,
      role: role as StaffRole,
      scope: "UNIT",
      unitId,
      recurrenceDays: recurrenceDays ?? ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
      registeredById: session.user.id,
      startDate: startDate ? new Date(startDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      staffPersonId: person.id,
      associationId: association.id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create staff" },
      { status: 400 },
    );
  }
}
