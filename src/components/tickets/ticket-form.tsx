"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["PLUMBING", "ELECTRICAL", "CIVIL", "HOUSEKEEPING", "SECURITY", "OTHER"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function TicketForm() {
  const [category, setCategory] = useState("PLUMBING");
  const [priority, setPriority] = useState("MEDIUM");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; id?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, priority, subject, description }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setSubject("");
        setDescription("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Ticket created! <a href={`/tickets/${result.id}`} className="underline">View ticket</a>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ticket-category" className="text-sm font-medium">Category</label>
          <select id="ticket-category" value={category} onChange={(e) => setCategory(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="ticket-priority" className="text-sm font-medium">Priority</label>
          <select id="ticket-priority" value={priority} onChange={(e) => setPriority(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ticket-subject" className="text-sm font-medium">Subject</label>
        <input id="ticket-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ticket-description" className="text-sm font-medium">Description</label>
        <textarea id="ticket-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <button type="submit" disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
        ) : (
          "Create Ticket"
        )}
      </button>
    </form>
  );
}
