"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

export function EventForm({
  communityId,
  facilities = [],
}: {
  communityId?: string;
  facilities?: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string; id?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, location, startsAt, endsAt,
          scope: communityId ? "SUB_COMMUNITY" : "GLOBAL",
          subCommunityId: communityId,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
          facilityId: facilityId || null,
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setTitle("");
        setDescription("");
        setLocation("");
        setStartsAt("");
        setEndsAt("");
        setMaxAttendees("");
        setFacilityId("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Event created! <a href={`/events/${result.id}`} className="underline">View event</a>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Event details…"
          minHeight="140px"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Location</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Rooftop Recreation Center"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="event-starts" className="text-sm font-medium">Starts At</label>
          <input id="event-starts" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="event-ends" className="text-sm font-medium">Ends At</label>
          <input id="event-ends" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required min={startsAt || undefined}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="event-max" className="text-sm font-medium">Max Attendees (optional)</label>
        <input id="event-max" type="number" min={1} value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)}
          placeholder="Unlimited"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
      </div>

      {facilities.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="event-facility" className="text-sm font-medium">Link amenity (optional)</label>
          <select
            id="event-facility"
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:h-9 md:text-sm"
          >
            <option value="">No linked booking</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Reserves the amenity for this event time. May require leader approval.
          </p>
        </div>
      )}

      <button type="submit" disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
        ) : (
          "Create Event"
        )}
      </button>
    </form>
  );
}
