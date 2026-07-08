"use client";

import { useState, useTransition } from "react";
import { DESIGNATION_TITLES, designationTitleLabels } from "@/lib/designation-labels";

const TITLES = DESIGNATION_TITLES.map((t) => designationTitleLabels[t]);

export function CommitteeForm() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("President");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/committee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, title, startDate, endDate: endDate || null }),
        });
        const data = await res.json();
        setResult(data);
        if (data.success) setEmail("");
      } catch {
        setResult({ error: "Failed to save" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      )}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Designation saved</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">User Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <select
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TITLES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">End Date (optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? "Saving..." : "Add Designation"}
      </button>
    </form>
  );
}
