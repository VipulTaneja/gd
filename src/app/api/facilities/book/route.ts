import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { facilityId, startsAt, endsAt } = await request.json();

  if (!facilityId || !startsAt || !endsAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check per-user booking limit
  const facility = await db.facility.findUnique({ where: { id: facilityId } });
  if (!facility) return NextResponse.json({ error: "Facility not found" }, { status: 404 });

  const userBookings = await db.facilityBooking.count({
    where: {
      facilityId,
      userId: session.user!.id,
      startsAt: { gte: new Date() },
      status: { not: "CANCELLED" },
    },
  });

  if (userBookings >= facility.maxBookingsPerUser) {
    return NextResponse.json({ error: `Maximum ${facility.maxBookingsPerUser} bookings per user` }, { status: 400 });
  }

  // Check blackout periods
  const overlappingBlackout = await db.facilityBlackout.findFirst({
    where: {
      facilityId,
      startsAt: { lt: new Date(endsAt) },
      endsAt: { gt: new Date(startsAt) },
    },
  });

  if (overlappingBlackout) {
    return NextResponse.json({ error: "Slot overlaps with maintenance period" }, { status: 400 });
  }

  // Check capacity
  const overlappingBookings = await db.facilityBooking.count({
    where: {
      facilityId,
      startsAt: { lt: new Date(endsAt) },
      endsAt: { gt: new Date(startsAt) },
      status: { not: "CANCELLED" },
    },
  });

  if (overlappingBookings >= facility.capacity) {
    return NextResponse.json({ error: "Slot is fully booked" }, { status: 400 });
  }

  // Check for exclusive booking conflict
  if (facility.capacity === 1) {
    const existing = await db.facilityBooking.findFirst({
      where: {
        facilityId,
        startsAt: new Date(startsAt),
        status: { not: "CANCELLED" },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Slot already booked" }, { status: 400 });
    }
  }

  const status = facility.requiresApproval ? "PENDING_APPROVAL" : "CONFIRMED";

  const booking = await db.facilityBooking.create({
    data: {
      facilityId,
      userId: session.user!.id,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      status,
    },
  });

  return NextResponse.json({ success: true, id: booking.id, status });
}
