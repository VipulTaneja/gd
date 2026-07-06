"use client";

import { useState, useTransition } from "react";

interface Booking {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

interface Blackout {
  startsAt: string;
  endsAt: string;
}

export function BookingGrid({
  facilityId,
  slotMinutes,
  maxAdvDays,
  capacity,
  existingBookings,
  blackouts,
  userUnitId,
}: {
  facilityId: string;
  slotMinutes: number;
  maxAdvDays: number;
  capacity: number;
  existingBookings: Booking[];
  blackouts: Blackout[];
  userUnitId: string | null;
}) {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    return d;
  });
  const [, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const slotsPerDay = Math.floor(24 * 60 / slotMinutes);
  const hours = Array.from({ length: slotsPerDay }, (_, i) => {
    const h = Math.floor((i * slotMinutes) / 60);
    const m = (i * slotMinutes) % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });

  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxAdvDays);

  const getSlotStatus = (day: Date, slotIndex: number) => {
    const slotStart = new Date(day);
    const [h, m] = hours[slotIndex].split(":").map(Number);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes);

    if (slotEnd <= now) return "past";
    if (slotStart > maxDate) return "unavailable";

    // Check blackouts
    for (const b of blackouts) {
      if (slotStart < new Date(b.endsAt) && slotEnd > new Date(b.startsAt)) return "blackout";
    }

    // Check bookings
    const booked = existingBookings.filter((booking) => {
      const bStart = new Date(booking.startsAt);
      const bEnd = new Date(booking.endsAt);
      return slotStart < bEnd && slotEnd > bStart;
    });

    if (booked.length >= capacity) return "full";
    if (booked.length > 0) return "available";

    return "available";
  };

  const handleBook = (day: Date, slotIndex: number) => {
    if (!userUnitId) return;
    const slotStart = new Date(day);
    const [h, m] = hours[slotIndex].split(":").map(Number);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes);

    if (!confirm(`Book ${slotStart.toLocaleString()} — ${slotEnd.toLocaleString()}?`)) return;

    startTransition(async () => {
      const res = await fetch("/api/facilities/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          unitId: userUnitId,
          startsAt: slotStart.toISOString(),
          endsAt: slotEnd.toISOString(),
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) window.location.reload();
    });
  };

  const cellColors: Record<string, string> = {
    past: "bg-muted/30",
    available: "bg-green-50 hover:bg-green-100 cursor-pointer",
    full: "bg-red-50",
    blackout: "bg-amber-50",
    unavailable: "bg-muted/20",
  };

  return (
    <div className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}

      <div className="flex items-center justify-between">
        <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-sm hover:bg-muted">
          ← Prev
        </button>
        <span className="text-sm font-medium">
          {weekStart.toLocaleDateString()} — {days[6].toLocaleDateString()}
        </span>
        <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-input px-3 text-sm hover:bg-muted">
          Next →
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-px bg-border min-w-[600px]">
          <div className="bg-card p-2 text-xs font-medium text-muted-foreground">Time</div>
          {days.map((d) => (
            <div key={d.toISOString()} className="bg-card p-2 text-xs font-medium text-center">
              {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
            </div>
          ))}

          {hours.map((h, si) => (
            <React.Fragment key={h}>
              <div className="bg-card p-2 text-xs text-muted-foreground">{h}</div>
              {days.map((d) => {
                const status = getSlotStatus(d, si);
                return (
                  <div
                    key={`${d.toISOString()}-${si}`}
                    className={`bg-card p-1 min-h-[32px] ${cellColors[status]} transition-colors`}
                    onClick={() => status === "available" && handleBook(d, si)}
                  >
                    {status === "full" && <span className="text-[10px] text-red-600">Full</span>}
                    {status === "blackout" && <span className="text-[10px] text-amber-600">Mnt</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-green-50 border" /> Available</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-red-50 border" /> Full</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-50 border" /> Maintenance</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-muted/30 border" /> Past</span>
      </div>
    </div>
  );
}

import React from "react";
