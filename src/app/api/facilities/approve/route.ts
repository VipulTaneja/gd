import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { canApproveFacilityBooking } from "@/lib/rbac-leaders";
import { createNotification } from "@/lib/notifications";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const facilityId = searchParams.get("facilityId");
  if (!facilityId) {
    return NextResponse.json({ error: "facilityId is required" }, { status: 400 });
  }

  const canApprove = await canApproveFacilityBooking(session.user.id, facilityId);
  if (!canApprove) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const bookings = await db.facilityBooking.findMany({
    where: {
      facilityId,
      status: "PENDING_APPROVAL",
      startsAt: { gte: new Date() },
    },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      startsAt: b.startsAt.toISOString(),
      endsAt: b.endsAt.toISOString(),
      user: { id: b.user.id, name: b.user.name },
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, approve, rejectionReason } = await request.json();
  if (!bookingId || typeof approve !== "boolean") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const booking = await db.facilityBooking.findUnique({
    where: { id: bookingId },
    include: { facility: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "PENDING_APPROVAL") {
    return NextResponse.json({ error: "Booking is not pending approval" }, { status: 400 });
  }

  const canApprove = await canApproveFacilityBooking(session.user.id, booking.facilityId);
  if (!canApprove) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!approve) {
    const reason = rejectionReason?.trim();
    if (!reason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }
  }

  if (approve) {
    const overlappingConfirmed = await db.facilityBooking.count({
      where: {
        facilityId: booking.facilityId,
        id: { not: booking.id },
        startsAt: { lt: booking.endsAt },
        endsAt: { gt: booking.startsAt },
        status: "CONFIRMED",
      },
    });

    if (overlappingConfirmed >= booking.facility.capacity) {
      return NextResponse.json({ error: "Slot is fully booked" }, { status: 400 });
    }

    if (booking.facility.capacity === 1) {
      const existing = await db.facilityBooking.findFirst({
        where: {
          facilityId: booking.facilityId,
          startsAt: booking.startsAt,
          status: "CONFIRMED",
          id: { not: booking.id },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Slot already booked" }, { status: 400 });
      }
    }

    await db.facilityBooking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    await logAction(session.user.id, "FACILITY_BOOKING_APPROVED", "FacilityBooking", bookingId, {
      facilityId: booking.facilityId,
    });

    await createNotification(
      booking.userId,
      "GENERAL",
      `${booking.facility.name}: booking approved`,
      `Your booking for ${booking.startsAt.toLocaleString()} was approved.`,
      `/facilities/${booking.facilityId}`,
    );
  } else {
    const reason = rejectionReason!.trim();
    await db.facilityBooking.update({
      where: { id: bookingId },
      data: {
        status: "REJECTED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    await logAction(session.user.id, "FACILITY_BOOKING_REJECTED", "FacilityBooking", bookingId, {
      facilityId: booking.facilityId,
      rejectionReason: reason,
    });

    await createNotification(
      booking.userId,
      "GENERAL",
      `${booking.facility.name}: booking declined`,
      reason,
      `/profile`,
    );
  }

  return NextResponse.json({ success: true, status: approve ? "CONFIRMED" : "REJECTED" });
}
