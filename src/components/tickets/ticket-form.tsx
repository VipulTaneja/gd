"use client";

import { useState, useTransition } from "react";
import { Loader2, Wrench, Zap, Building, Home, Shield, HelpCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  { value: "PLUMBING", label: "Plumbing", icon: Wrench },
  { value: "ELECTRICAL", label: "Electrical", icon: Zap },
  { value: "CIVIL", label: "Civil", icon: Building },
  { value: "HOUSEKEEPING", label: "Housekeeping", icon: Home },
  { value: "SECURITY", label: "Security", icon: Shield },
  { value: "OTHER", label: "Other", icon: HelpCircle },
];

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

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

  const selectedCategory = CATEGORIES.find((c) => c.value === category);
  const CategoryIcon = selectedCategory?.icon ?? HelpCircle;

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
          <label htmlFor="ticket-category" className="flex items-center gap-1.5 text-sm font-medium">
            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="ticket-category" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="flex items-center gap-2">
                    <c.icon className="h-4 w-4" />
                    {c.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="ticket-priority" className="text-sm font-medium">Priority</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="ticket-priority" className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ticket-subject" className="text-sm font-medium">Subject</label>
        <input id="ticket-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:text-sm" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ticket-description" className="text-sm font-medium">Description</label>
        <textarea id="ticket-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:text-sm" />
      </div>

      <button type="submit" disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
        ) : (
          "Create Ticket"
        )}
      </button>
    </form>
  );
}
