"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

const HELP_TYPES = ["MAID", "COOK", "DRIVER", "GUARD", "GARDENER", "OTHER"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface DomesticHelpFormProps {
  unitId: string;
  onSuccess?: () => void;
}

export function DomesticHelpForm({ unitId, onSuccess }: DomesticHelpFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [helpType, setHelpType] = useState("MAID");
  const [selectedDays, setSelectedDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/domestic-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, helpType, recurrenceDays: selectedDays, unitId }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setName("");
        setPhone("");
        onSuccess?.();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Domestic help registered successfully!
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="help-name" className="text-sm font-medium">Name *</label>
          <input id="help-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="help-phone" className="text-sm font-medium">Phone</label>
          <input id="help-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="help-type" className="text-sm font-medium">Help Type</label>
        <select id="help-type" value={helpType} onChange={(e) => setHelpType(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          {HELP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Recurrence Days</label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors ${
                selectedDays.includes(day)
                  ? "bg-gold text-black"
                  : "border border-input hover:bg-muted"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering...</>
        ) : (
          "Register Help"
        )}
      </button>
    </form>
  );
}
