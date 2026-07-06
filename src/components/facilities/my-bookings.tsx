"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FriendlyBadge } from "@/components/shared/friendly-badge";

interface MyBooking {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  rejectionReason: string | null;
  facility: { id: string; name: string };
}

export function MyFacilityBookings({ bookings }: { bookings: MyBooking[] }) {
  if (bookings.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold mb-4">My amenity bookings</h3>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <MyBookingRow key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

function MyBookingRow({ booking }: { booking: MyBooking }) {
  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/facilities/${booking.facility.id}`}
            className="font-medium hover:text-gold"
          >
            {booking.facility.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {start.toLocaleString()} — {end.toLocaleTimeString()}
          </p>
        </div>
        <FriendlyBadge value={booking.status} variant="status" />
      </div>
      {booking.status === "REJECTED" && booking.rejectionReason && (
        <p className="text-sm text-red-700 bg-red-50 rounded-md px-3 py-2">
          Reason: {booking.rejectionReason}
        </p>
      )}
    </div>
  );
}

export function AmenityLeaderQueue({
  bookings,
}: {
  bookings: {
    id: string;
    startsAt: string;
    endsAt: string;
    facility: { id: string; name: string };
    user: { id: string; name: string };
  }[];
}) {
  if (bookings.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <h2 className="font-heading text-lg font-semibold">Pending amenity approvals</h2>
      <p className="text-sm text-muted-foreground">
        All bookings awaiting your approval across amenities you lead.
      </p>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <QueueRow key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

function QueueRow({
  booking,
}: {
  booking: {
    id: string;
    startsAt: string;
    endsAt: string;
    facility: { id: string; name: string };
    user: { id: string; name: string };
  };
}) {
  const [pending, startTransition] = useTransition();

  const handleAction = (approve: boolean) => {
    let rejectionReason: string | undefined;
    if (!approve) {
      rejectionReason = window.prompt("Rejection reason (required):")?.trim();
      if (!rejectionReason) return;
    }

    startTransition(async () => {
      await fetch("/api/facilities/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, approve, rejectionReason }),
      });
      window.location.reload();
    });
  };

  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{booking.user.name}</p>
        <p className="text-sm text-muted-foreground">
          {booking.facility.name} · {start.toLocaleString()} — {end.toLocaleTimeString()}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => handleAction(true)}
          className="inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => handleAction(false)}
          className="inline-flex h-11 min-h-11 items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
