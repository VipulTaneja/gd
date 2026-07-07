import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { resolveStaffDestinationUnits } from "@/lib/staff-passes";

export async function POST(request: Request) {
  const { otp } = await request.json();

  if (!otp) return NextResponse.json({ error: "OTP required" }, { status: 400 });

  const pass = await db.visitorPass.findFirst({
    where: {
      otp,
      status: "ACTIVE",
    },
    include: {
      unit: { select: { unitNumber: true } },
      user: { select: { name: true } },
      staffPerson: { select: { id: true, name: true, phone: true, photoUrl: true } },
    },
  });

  if (!pass) {
    return NextResponse.json({ valid: false, error: "Invalid or expired pass" });
  }

  const now = new Date();

  if (now < pass.validFrom || now > pass.validUntil) {
    return NextResponse.json({ valid: false, error: "Pass is not valid at this time" });
  }

  let unitNumbers: string[] = [];
  if (pass.staffPersonId) {
    const destinations = await resolveStaffDestinationUnits(pass.staffPersonId);
    unitNumbers = destinations.map((d) => d.unit!.unitNumber);
  } else if (pass.unit) {
    unitNumbers = [pass.unit.unitNumber];
  }

  const unitLabel = unitNumbers.length > 0 ? unitNumbers.join(", ") : "—";

  if (pass.isRecurring) {
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = dayNames[now.getDay()];
    if (!pass.recurrenceDays.includes(today)) {
      return NextResponse.json({ valid: false, error: "Pass is not valid on this day" });
    }

    if (pass.staffPersonId) {
      const destinations = await resolveStaffDestinationUnits(pass.staffPersonId);
      const memberIds = new Set<string>();
      for (const dest of destinations) {
        if (!dest.unitId) continue;
        const members = await db.unitMembership.findMany({
          where: {
            unitId: dest.unitId,
            OR: [{ endDate: null }, { endDate: { gt: now } }],
          },
          select: { userId: true },
        });
        members.forEach((m) => memberIds.add(m.userId));
      }
      for (const userId of memberIds) {
        await createNotification(
          userId,
          "VISITOR_ARRIVED",
          `${pass.visitorName} has arrived`,
          `Regular help ${pass.visitorName} has arrived at the gate (${unitLabel}).`,
          "/staff",
        );
      }
    } else {
      await createNotification(
        pass.userId,
        "VISITOR_ARRIVED",
        `${pass.visitorName} has arrived`,
        `Your visitor ${pass.visitorName} has arrived at the gate for unit ${unitLabel}.`,
        "/visitors",
      );
    }

    return NextResponse.json({
      valid: true,
      visitorName: pass.visitorName,
      unitNumber: unitLabel,
      unitNumbers,
      visitorType: pass.visitorType,
      parkingSlot: pass.parkingSlot,
      recurring: true,
      staffPhone: pass.staffPerson?.phone ?? null,
      isStaffPass: !!pass.staffPersonId,
    });
  }

  await db.visitorPass.update({
    where: { id: pass.id },
    data: { status: "USED", usedAt: now },
  });

  await createNotification(
    pass.userId,
    "VISITOR_ARRIVED",
    `${pass.visitorName} has arrived`,
    `Your visitor ${pass.visitorName} has arrived at the gate for unit ${unitLabel}.`,
    "/visitors",
  );

  return NextResponse.json({
    valid: true,
    visitorName: pass.visitorName,
    unitNumber: unitLabel,
    unitNumbers,
    visitorType: pass.visitorType,
    parkingSlot: pass.parkingSlot,
    recurring: false,
    staffPhone: pass.staffPerson?.phone ?? null,
    isStaffPass: !!pass.staffPersonId,
  });
}
