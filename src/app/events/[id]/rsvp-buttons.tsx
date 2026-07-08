"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InlineAlert } from "@/components/shared/inline-alert";

const statuses = [
  { value: "ACCEPTED", label: "Accept", color: "bg-green-600 hover:bg-green-700" },
  { value: "MAYBE", label: "Maybe", color: "bg-amber-500 hover:bg-amber-600" },
  { value: "DECLINED", label: "Decline", color: "bg-red-600 hover:bg-red-700" },
] as const;

export function RsvpButtons({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRsvp = (status: string) => {
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update RSVP");
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      {error && <InlineAlert>{error}</InlineAlert>}
      <div className="flex gap-3">
        {statuses.map((s) => (
          <button
            key={s.value}
            disabled={pending}
            onClick={() => handleRsvp(s.value)}
            className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
              currentStatus === s.value
                ? "ring-2 ring-offset-2 ring-gold " + s.color
                : s.color
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
