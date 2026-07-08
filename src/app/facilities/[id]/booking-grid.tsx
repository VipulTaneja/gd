"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FilterPillRow } from "@/components/shared/filter-pill-row";
import { SuccessAnimation } from "@/components/shared/success-animation";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

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
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [isPending, startTransition] = useTransition();
  const [bookingSlotKey, setBookingSlotKey] = useState<string | null>(null);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{ day: Date; slotIndex: number } | null>(null);

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

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + maxAdvDays);
    return d;
  }, [maxAdvDays]);

  const slotStatusMap = useMemo(() => {
    const map = new Map<string, SlotStatus>();
    const nowSnapshot = new Date();

    for (const day of days) {
      for (let slotIndex = 0; slotIndex < hours.length; slotIndex++) {
        const slotStart = new Date(day);
        const [h, m] = hours[slotIndex].split(":").map(Number);
        slotStart.setHours(h, m, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes);

        let status: SlotStatus;
        if (slotEnd <= nowSnapshot) {
          status = "past";
        } else if (slotStart > maxDate) {
          status = "unavailable";
        } else if (
          blackouts.some((b) => slotStart < new Date(b.endsAt) && slotEnd > new Date(b.startsAt))
        ) {
          status = "blackout";
        } else {
          const bookedCount = existingBookings.filter(
            (booking) => slotStart < new Date(booking.endsAt) && slotEnd > new Date(booking.startsAt),
          ).length;
          status = bookedCount >= capacity ? "full" : "available";
        }

        map.set(`${day.toISOString()}-${slotIndex}`, status);
      }
    }

    return map;
  }, [days, hours, slotMinutes, blackouts, existingBookings, capacity, maxDate]);

  const getSlotStatus = (day: Date, slotIndex: number): SlotStatus =>
    slotStatusMap.get(`${day.toISOString()}-${slotIndex}`) ?? "unavailable";

  const slotTimeRange = (day: Date, slotIndex: number) => {
    const slotStart = new Date(day);
    const [h, m] = hours[slotIndex].split(":").map(Number);
    slotStart.setHours(h, m, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes);
    return { slotStart, slotEnd };
  };

  const requestBook = (day: Date, slotIndex: number) => {
    if (!userUnitId || isPending) return;
    setPendingSlot({ day, slotIndex });
  };

  const confirmBook = () => {
    if (!pendingSlot || !userUnitId) return;
    const { day, slotIndex } = pendingSlot;
    const { slotStart, slotEnd } = slotTimeRange(day, slotIndex);

    setPendingSlot(null);
    setBookingSlotKey(`${day.toISOString()}-${slotIndex}`);
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
      setBookingSlotKey(null);
      if (data.success) setShowSuccess(true);
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

  const SLOT_STATUS_STYLES: Record<SlotStatus, { bg: string; border: string; text: string }> = {
    past: { bg: "bg-muted/30", border: "border-transparent", text: "text-muted-foreground" },
    available: {
      bg: "bg-green-50 hover:bg-green-100 active:bg-green-100 cursor-pointer",
      border: "border-green-200",
      text: "",
    },
    full: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700" },
    blackout: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-800" },
    unavailable: { bg: "bg-muted/20", border: "border-transparent", text: "text-muted-foreground" },
  };

  const mobileSlotClass = (status: SlotStatus) =>
    cn(
      "flex min-h-11 w-full items-center justify-between rounded-lg border px-4 text-sm transition-colors",
      SLOT_STATUS_STYLES[status].border,
      SLOT_STATUS_STYLES[status].bg,
      SLOT_STATUS_STYLES[status].text,
    );

  return (
    <div className="space-y-4">
      {showSuccess && (
        <SuccessAnimation
          message="Booked!"
          onComplete={() => {
            setShowSuccess(false);
            router.refresh();
          }}
        />
      )}

      {result?.error && (
        <div className="flex items-start justify-between gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          <span>{result.error}</span>
          <button
            type="button"
            onClick={() => setResult(null)}
            aria-label="Dismiss error"
            className="shrink-0 text-red-800/70 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
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
        <FilterPillRow>
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
        </FilterPillRow>

        <div className="space-y-2">
          {hours.map((label, slotIndex) => {
            const status = getSlotStatus(selectedDay, slotIndex);
            const end = new Date(selectedDay);
            const [h, m] = label.split(":").map(Number);
            end.setHours(h, m, 0, 0);
            end.setMinutes(end.getMinutes() + slotMinutes);
            const endLabel = end.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

            const slotKey = `${selectedDay.toISOString()}-${slotIndex}`;
            const isBookingThisSlot = bookingSlotKey === slotKey;

            return (
              <button
                key={label}
                type="button"
                disabled={status !== "available" || !userUnitId || isPending}
                onClick={() => status === "available" && requestBook(selectedDay, slotIndex)}
                className={cn(mobileSlotClass(status), isPending && "opacity-60")}
              >
                <span className="font-medium">{label} – {endLabel}</span>
                <span className="text-xs">
                  {isBookingThisSlot && "Booking…"}
                  {!isBookingThisSlot && status === "available" && "Tap to book"}
                  {!isBookingThisSlot && status === "full" && "Full"}
                  {!isBookingThisSlot && status === "blackout" && "Maintenance"}
                  {!isBookingThisSlot && status === "past" && "Past"}
                  {!isBookingThisSlot && status === "unavailable" && "Unavailable"}
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
                const slotKey = `${d.toISOString()}-${si}`;
                const isBookingThisSlot = bookingSlotKey === slotKey;
                const clickable = status === "available" && !isPending;
                return (
                  <div
                    key={slotKey}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    title={status === "blackout" ? "Maintenance" : undefined}
                    className={cn(
                      "bg-card p-1 min-h-11",
                      SLOT_STATUS_STYLES[status].bg,
                      isPending && "pointer-events-none opacity-60",
                      "transition-colors",
                    )}
                    onClick={() => clickable && requestBook(d, si)}
                    onKeyDown={(e) => {
                      if (clickable && (e.key === "Enter" || e.key === " ")) {
                        requestBook(d, si);
                      }
                    }}
                  >
                    {isBookingThisSlot && <span className="text-[10px] text-muted-foreground">…</span>}
                    {status === "available" && <Check className="h-3 w-3 text-green-600" />}
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

      <ConfirmDialog
        open={pendingSlot != null}
        onOpenChange={(open) => !open && setPendingSlot(null)}
        title="Confirm booking"
        description={
          pendingSlot
            ? (() => {
                const { slotStart, slotEnd } = slotTimeRange(pendingSlot.day, pendingSlot.slotIndex);
                return `Book ${slotStart.toLocaleString()} — ${slotEnd.toLocaleString()}?`;
              })()
            : undefined
        }
        confirmLabel="Book"
        destructive={false}
        pending={isPending}
        onConfirm={confirmBook}
      />
    </div>
  );
}
