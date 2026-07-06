import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId } = await request.json();

  const booking = await db.facilityBooking.findUnique({
    where: { id: bookingId },
    include: { facility: true },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.userId !== session.user!.id && !["SUPER_ADMIN", "ADMIN"].includes(
    (await db.user.findUnique({ where: { id: session.user!.id } }))?.globalRole ?? ""
  )) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const now = new Date();
  const minutesUntilStart = (booking.startsAt.getTime() - now.getTime()) / 60000;
  if (minutesUntilStart < booking.facility.minCancelMinutes) {
    return NextResponse.json({
      error: `Cannot cancel less than ${booking.facility.minCancelMinutes} minutes before start`,
    }, { status: 400 });
  }

  await db.facilityBooking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
