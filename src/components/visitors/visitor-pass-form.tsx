"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const VISITOR_TYPES = ["GUEST", "DELIVERY", "DAILY_HELP", "CAB", "OTHER"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function VisitorPassForm({ unitId }: { unitId: string }) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorType, setVisitorType] = useState("GUEST");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [parkingSlot, setParkingSlot] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; passId?: string; activeCount?: number } | null>(null);

  const toggleDay = (day: string) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          visitorName,
          visitorPhone,
          visitorType,
          validFrom,
          validUntil,
          parkingSlot: parkingSlot || null,
          companyName: visitorType === "DELIVERY" ? companyName : null,
          isRecurring,
          recurrenceDays: isRecurring ? recurrenceDays : [],
        }),
      });
      const data = await res.json();
      setResult(data);
    });
  };

  if (result?.success && result.passId) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h2 className="font-heading text-xl font-bold">Pass Created!</h2>
        <p className="text-muted-foreground">OTP: <strong className="text-2xl font-mono">{result.passId}</strong></p>
        <a href={`/visitors/${result.passId}`}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light">
          View Pass & QR Code
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {result.error}
          {result.activeCount != null && (
            <>
              {" "}
              <Link href="/visitors" className="font-medium underline">
                Review your active passes
              </Link>{" "}
              and cancel one to free up a slot.
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Visitor Name</label>
          <input type="text" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Phone (optional)</label>
          <input type="tel" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Visitor Type</label>
        <select value={visitorType} onChange={(e) => setVisitorType(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          {VISITOR_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {visitorType === "DELIVERY" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Company Name</label>
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Amazon, Swiggy, Dunzo"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Valid From</label>
          <input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Valid Until</label>
          <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Parking Slot (optional)</label>
        <input type="text" value={parkingSlot} onChange={(e) => setParkingSlot(e.target.value)}
          placeholder="e.g. Visitor-P3"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded border-input" />
          Recurring pass (daily help)
        </label>
        {isRecurring && (
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors ${
                  recurrenceDays.includes(day) ? "bg-gold text-black" : "border border-input hover:bg-muted"
                }`}>
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
        ) : (
          "Create Pass"
        )}
      </button>
    </form>
  );
}
