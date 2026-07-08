"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UserLink } from "@/components/shared/user-link";
import { ApproveRejectButtons } from "@/components/shared/approve-reject-buttons";
import { RejectBookingDialog } from "@/components/shared/reject-booking-dialog";
import { InlineAlert } from "@/components/shared/inline-alert";

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
    if (initialBookings.length > 0) return;
    void fetchBookings();
  }, [fetchBookings, initialBookings.length]);

  if (!canApprove) return null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold">Pending Approvals</h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {error && <InlineAlert className="mb-4">{error}</InlineAlert>}

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
  const [rejectOpen, setRejectOpen] = useState(false);

  const submitAction = (approve: boolean, rejectionReason?: string) => {
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
      setRejectOpen(false);
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
      <ApproveRejectButtons
        pending={pending}
        onApprove={() => submitAction(true)}
        onReject={() => setRejectOpen(true)}
      />
      <RejectBookingDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        pending={pending}
        onConfirm={(reason) => submitAction(false, reason)}
      />
    </div>
  );
}
