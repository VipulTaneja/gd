"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserLink } from "@/components/shared/user-link";

interface PendingBooking {
  id: string;
  startsAt: string;
  endsAt: string;
  user: { id: string; name: string };
}

interface PendingBookingsProps {
  facilityId: string;
  canApprove: boolean;
  initialBookings?: PendingBooking[];
}

export function PendingBookings({
  facilityId,
  canApprove,
  initialBookings = [],
}: PendingBookingsProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<PendingBooking[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!canApprove) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/facilities/approve?facilityId=${facilityId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to load pending bookings");
        return;
      }
      setBookings(data.bookings ?? []);
    } catch {
      setError("Failed to load pending bookings");
    } finally {
      setLoading(false);
    }
  }, [canApprove, facilityId]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  if (!canApprove) return null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Pending Approvals</h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div>
      )}

      {bookings.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground">No pending bookings requiring approval.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <PendingBookingRow
              key={booking.id}
              booking={booking}
              onComplete={() => {
                void fetchBookings();
                router.refresh();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingBookingRow({
  booking,
  onComplete,
}: {
  booking: PendingBooking;
  onComplete: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAction = (approve: boolean) => {
    let rejectionReason: string | undefined;
    if (!approve) {
      rejectionReason = window.prompt("Rejection reason (required):")?.trim();
      if (!rejectionReason) return;
    }

    startTransition(async () => {
      setActionError(null);
      const res = await fetch("/api/facilities/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, approve, rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Action failed");
        return;
      }
      onComplete();
    });
  };

  const start = new Date(booking.startsAt);
  const end = new Date(booking.endsAt);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <UserLink userId={booking.user.id} name={booking.user.name} className="font-medium" />
        <p className="text-sm text-muted-foreground">
          {start.toLocaleString()} — {end.toLocaleTimeString()}
        </p>
        {actionError && <p className="text-xs text-red-600 mt-1">{actionError}</p>}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => handleAction(true)}
          className="inline-flex h-9 min-h-11 flex-1 items-center justify-center rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 sm:min-h-9 sm:flex-none"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => handleAction(false)}
          className="inline-flex h-9 min-h-11 flex-1 items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:min-h-9 sm:flex-none"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
