import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user!.id;
  const body = await request.json();
  const { unitId, visitorName, visitorPhone, visitorType, validFrom, validUntil, parkingSlot, isRecurring, recurrenceDays } = body;

  if (!unitId || !visitorName || !validFrom || !validUntil) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Rate limit: max 10 active passes per user (staff cron passes exempt — STAFF-080)
  const activeCount = await db.visitorPass.count({
    where: { userId, status: "ACTIVE", staffPersonId: null },
  });
  if (activeCount >= 10) {
    return NextResponse.json({ error: "Maximum 10 active passes allowed" }, { status: 400 });
  }

  const otp = generateOtp();

  const pass = await db.visitorPass.create({
    data: {
      userId,
      unitId,
      visitorName,
      visitorPhone: visitorPhone || null,
      visitorType,
      otp,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      parkingSlot: parkingSlot || null,
      isRecurring: isRecurring || false,
      recurrenceDays: recurrenceDays || [],
    },
  });

  return NextResponse.json({ success: true, passId: pass.id, otp });
}
