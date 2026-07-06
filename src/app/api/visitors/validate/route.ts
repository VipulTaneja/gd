import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const { otp } = await request.json();

  if (!otp) return NextResponse.json({ error: "OTP required" }, { status: 400 });

  const pass = await db.visitorPass.findFirst({
    where: {
      otp,
      status: "ACTIVE",
    },
    include: { unit: { select: { unitNumber: true } }, user: { select: { name: true } } },
  });

  if (!pass) {
    return NextResponse.json({ valid: false, error: "Invalid or expired pass" });
  }

  const now = new Date();

  if (now < pass.validFrom || now > pass.validUntil) {
    return NextResponse.json({ valid: false, error: "Pass is not valid at this time" });
  }

  if (pass.isRecurring) {
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = dayNames[now.getDay()];
    if (!pass.recurrenceDays.includes(today)) {
      return NextResponse.json({ valid: false, error: "Pass is not valid on this day" });
    }

    await createNotification(
      pass.userId,
      "VISITOR_ARRIVED",
      `${pass.visitorName} has arrived`,
      `Your visitor ${pass.visitorName} has arrived at the gate for unit ${pass.unit.unitNumber}.`,
      "/visitors"
    );

    return NextResponse.json({
      valid: true,
      visitorName: pass.visitorName,
      unitNumber: pass.unit.unitNumber,
      visitorType: pass.visitorType,
      parkingSlot: pass.parkingSlot,
      recurring: true,
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
    `Your visitor ${pass.visitorName} has arrived at the gate for unit ${pass.unit.unitNumber}.`,
    "/visitors"
  );

  return NextResponse.json({
    valid: true,
    visitorName: pass.visitorName,
    unitNumber: pass.unit.unitNumber,
    visitorType: pass.visitorType,
    parkingSlot: pass.parkingSlot,
    recurring: false,
  });
}
