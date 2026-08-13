"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { InlineAlert } from "@/components/shared/inline-alert";

export function EventForm({
  communityId,
  facilities = [],
}: {
  communityId?: string;
  facilities?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startsAt || !endsAt) {
      setError("Start and end times are required");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("End time must be after the start time");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          location,
          startsAt,
          endsAt,
          scope: communityId ? "SUB_COMMUNITY" : "GLOBAL",
          subCommunityId: communityId,
          maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
          facilityId: facilityId || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to create event");
        setPending(false);
        return;
      }
      router.push(data.id ? `/events/${data.id}` : "/events");
    } catch {
      setError("Network error — check your connection and try again");
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <InlineAlert>{error}</InlineAlert>}

      <div className="space-y-1.5">
        <label htmlFor="event-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
        />
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
        <label htmlFor="event-location" className="text-sm font-medium">
          Location
        </label>
        <input
          id="event-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Rooftop Recreation Center"
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="event-starts" className="text-sm font-medium">
            Starts At
          </label>
          <input
            id="event-starts"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="event-ends" className="text-sm font-medium">
            Ends At
          </label>
          <input
            id="event-ends"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            min={startsAt || undefined}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="event-max" className="text-sm font-medium">
          Max Attendees (optional)
        </label>
        <input
          id="event-max"
          type="number"
          min={1}
          value={maxAttendees}
          onChange={(e) => setMaxAttendees(e.target.value)}
          placeholder="Unlimited"
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
        />
      </div>

      {facilities.length > 0 && (
        <div className="space-y-1.5">
          <label htmlFor="event-facility" className="text-sm font-medium">
            Link amenity (optional)
          </label>
          <select
            id="event-facility"
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          >
            <option value="">No linked booking</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Reserves the amenity for this event time. May require leader approval.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
          </>
        ) : (
          "Create Event"
        )}
      </button>
    </form>
  );
}
