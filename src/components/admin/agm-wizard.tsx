"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, X } from "lucide-react";

export function AgmWizard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [resolutions, setResolutions] = useState<string[]>([""]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; eventId?: string } | null>(null);

  const addResolution = () => setResolutions([...resolutions, ""]);
  const removeResolution = (index: number) => setResolutions(resolutions.filter((_, i) => i !== index));
  const updateResolution = (index: number, value: string) => {
    const updated = [...resolutions];
    updated[index] = value;
    setResolutions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const validResolutions = resolutions.filter((r) => r.trim());
      const res = await fetch("/api/admin/agm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, startsAt, endsAt, location,
          resolutions: validResolutions,
        }),
      });
      const data = await res.json();
      setResult(data);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          AGM created! <a href={`/events/${result.eventId}`} className="underline">View event</a>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h3 className="font-heading text-lg font-semibold">AGM Details</h3>

        <div className="space-y-1.5">
          <label htmlFor="agm-title" className="text-sm font-medium">Title *</label>
          <input id="agm-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="e.g. Annual General Meeting 2026"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="agm-desc" className="text-sm font-medium">Description</label>
          <textarea id="agm-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="agm-starts" className="text-sm font-medium">Starts At *</label>
            <input id="agm-starts" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="agm-ends" className="text-sm font-medium">Ends At *</label>
            <input id="agm-ends" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required min={startsAt || undefined}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="agm-location" className="text-sm font-medium">Location</label>
            <input id="agm-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Community Hall"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">Resolutions</h3>
          <button type="button" onClick={addResolution}
            className="inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-medium hover:bg-muted transition-colors">
            <Plus className="h-3 w-3 mr-1" /> Add
          </button>
        </div>

        <div className="space-y-3">
          {resolutions.map((resolution, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={resolution}
                onChange={(e) => updateResolution(i, e.target.value)}
                placeholder={`Resolution ${i + 1}`}
                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {resolutions.length > 1 && (
                <button type="button" onClick={() => removeResolution(i)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg border hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Each resolution will be created as a poll with <code>isResolution=true</code> for formal voting.
        </p>
      </div>

      <button type="submit" disabled={pending || !title || !startsAt || !endsAt}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
        ) : (
          "Create AGM Package"
        )}
      </button>
    </form>
  );
}
