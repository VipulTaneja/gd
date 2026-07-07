"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

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

type SlotStatus = "past" | "available" | "full" | "blackout" | "unavailable";

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1);
  return d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function slotLabels(slotMinutes: number) {
  const slotsPerDay = Math.floor(24 * 60 / slotMinutes);
  return Array.from({ length: slotsPerDay }, (_, i) => {
    const h = Math.floor((i * slotMinutes) / 60);
    const m = (i * slotMinutes) % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });
}

function BookingLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded border bg-green-50" /> Available
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded border bg-red-50" /> Full
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded border bg-amber-50" /> Maintenance
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded border bg-muted/30" /> Past
      </span>
    </div>
  );
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
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const hours = useMemo(() => slotLabels(slotMinutes), [slotMinutes]);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [weekStart],
  );

  const now = new Date();
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + maxAdvDays);
    return d;
  }, [maxAdvDays]);

  const getSlotStatus = (day: Date, slotIndex: number): SlotStatus => {
    const slotStart = new Date(day);
    const [h, m] = hours[slotIndex].split(":").map(Number);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes);

    if (slotEnd <= now) return "past";
    if (slotStart > maxDate) return "unavailable";

    for (const b of blackouts) {
      if (slotStart < new Date(b.endsAt) && slotEnd > new Date(b.startsAt)) return "blackout";
    }

    const booked = existingBookings.filter((booking) => {
      const bStart = new Date(booking.startsAt);
      const bEnd = new Date(booking.endsAt);
      return slotStart < bEnd && slotEnd > bStart;
    });

    if (booked.length >= capacity) return "full";
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

  const shiftWeek = (delta: number) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + delta * 7);
    setWeekStart(next);
    const nextDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(next);
      d.setDate(d.getDate() + i);
      return d;
    });
    const stillInWeek = nextDays.some((d) => sameDay(d, selectedDay));
    if (!stillInWeek) {
      const todayInWeek = nextDays.find((d) => sameDay(d, new Date()));
      setSelectedDay(todayInWeek ?? nextDays[0]);
    }
  };

  const cellColors: Record<SlotStatus, string> = {
    past: "bg-muted/30",
    available: "bg-green-50 hover:bg-green-100 cursor-pointer",
    full: "bg-red-50",
    blackout: "bg-amber-50",
    unavailable: "bg-muted/20",
  };

  const mobileSlotClass = (status: SlotStatus) =>
    cn(
      "flex min-h-11 w-full items-center justify-between rounded-lg border px-4 text-sm transition-colors",
      status === "available" && "border-green-200 bg-green-50 hover:bg-green-100 active:bg-green-100",
      status === "full" && "border-red-100 bg-red-50 text-red-700",
      status === "blackout" && "border-amber-100 bg-amber-50 text-amber-800",
      status === "past" && "border-transparent bg-muted/30 text-muted-foreground",
      status === "unavailable" && "border-transparent bg-muted/20 text-muted-foreground",
    );

  return (
    <div className="space-y-4">
      {result?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      )}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftWeek(-1)}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-input px-3 text-sm hover:bg-muted"
        >
          ← Prev
        </button>
        <span className="text-center text-sm font-medium">
          {weekStart.toLocaleDateString()} — {days[6].toLocaleDateString()}
        </span>
        <button
          type="button"
          onClick={() => shiftWeek(1)}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-input px-3 text-sm hover:bg-muted"
        >
          Next →
        </button>
      </div>

      {/* Mobile / tablet: pick a day, then tap a slot */}
      <div className="space-y-3 lg:hidden">
        <div className="flex gap-2 overflow-x-auto flex-nowrap snap-x snap-mandatory scrollbar-hide pb-1">
          {days.map((day) => {
            const isSelected = sameDay(day, selectedDay);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "inline-flex min-h-11 shrink-0 snap-start flex-col items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-gold bg-gold text-black"
                    : "border-input hover:bg-muted",
                )}
              >
                <span className="text-[10px] uppercase tracking-wide opacity-80">
                  {day.toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
                <span>{day.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {hours.map((label, slotIndex) => {
            const status = getSlotStatus(selectedDay, slotIndex);
            const end = new Date(selectedDay);
            const [h, m] = label.split(":").map(Number);
            end.setHours(h, m, 0, 0);
            end.setMinutes(end.getMinutes() + slotMinutes);
            const endLabel = end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

            return (
              <button
                key={label}
                type="button"
                disabled={status !== "available" || !userUnitId}
                onClick={() => status === "available" && handleBook(selectedDay, slotIndex)}
                className={mobileSlotClass(status)}
              >
                <span className="font-medium">{label} – {endLabel}</span>
                <span className="text-xs">
                  {status === "available" && "Tap to book"}
                  {status === "full" && "Full"}
                  {status === "blackout" && "Maintenance"}
                  {status === "past" && "Past"}
                  {status === "unavailable" && "Unavailable"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: week grid */}
      <div className="hidden overflow-x-auto lg:block">
        <div className="grid min-w-[600px] grid-cols-8 gap-px bg-border">
          <div className="bg-card p-2 text-xs font-medium text-muted-foreground">Time</div>
          {days.map((d) => (
            <div key={d.toISOString()} className="bg-card p-2 text-center text-xs font-medium">
              {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}
            </div>
          ))}

          {hours.map((h, si) => (
            <div key={h} className="contents">
              <div className="bg-card p-2 text-xs text-muted-foreground">{h}</div>
              {days.map((d) => {
                const status = getSlotStatus(d, si);
                return (
                  <div
                    key={`${d.toISOString()}-${si}`}
                    role={status === "available" ? "button" : undefined}
                    tabIndex={status === "available" ? 0 : undefined}
                    className={cn("bg-card p-1 min-h-[36px]", cellColors[status], "transition-colors")}
                    onClick={() => status === "available" && handleBook(d, si)}
                    onKeyDown={(e) => {
                      if (status === "available" && (e.key === "Enter" || e.key === " ")) {
                        handleBook(d, si);
                      }
                    }}
                  >
                    {status === "full" && <span className="text-[10px] text-red-600">Full</span>}
                    {status === "blackout" && <span className="text-[10px] text-amber-600">Mnt</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <BookingLegend />
    </div>
  );
}
