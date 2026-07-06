"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

interface MoveRequestFormProps {
  unitId: string;
  unitNumber: string;
}

export function MoveRequestForm({ unitId, unitNumber }: MoveRequestFormProps) {
  const [type, setType] = useState<"MOVE_IN" | "MOVE_OUT">("MOVE_OUT");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, unitId, notes }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) setNotes("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Move request submitted for {unitNumber}. Admin will review shortly.
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="move-type" className="text-sm font-medium">Request Type</label>
        <select id="move-type" value={type} onChange={(e) => setType(e.target.value as "MOVE_IN" | "MOVE_OUT")}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <option value="MOVE_OUT">Move Out</option>
          <option value="MOVE_IN">Move In (New Tenant)</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="move-notes" className="text-sm font-medium">Notes (optional)</label>
        <textarea id="move-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Any additional details about the move..."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <button type="submit" disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
        ) : (
          "Submit Request"
        )}
      </button>
    </form>
  );
}
