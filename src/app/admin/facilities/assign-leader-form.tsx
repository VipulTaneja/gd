"use client";

import { useState, useTransition } from "react";
import { assignAmenityLeader } from "./actions";

export function AssignLeaderForm({ facilityId }: { facilityId: string }) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await assignAmenityLeader(facilityId, email);
      setResult(res);
      if (res.success) setEmail("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Assigning a leader turns on approval-required bookings for this facility.
      </p>
      {result?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      )}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Amenity leader assigned</div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="User email"
          required
          className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50 sm:min-h-9"
        >
          {pending ? "..." : "Assign leader"}
        </button>
      </div>
    </form>
  );
}
