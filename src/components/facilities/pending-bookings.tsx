"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface PendingBooking {
  id: string;
  startsAt: string;
  endsAt: string;
  user: { name: string };
}

interface PendingBookingsProps {
  facilityId: string;
}

export function PendingBookings({ facilityId }: PendingBookingsProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold mb-4">Pending Approvals</h3>
      <p className="text-sm text-muted-foreground">
        No pending bookings requiring approval.
      </p>
    </div>
  );
}
