"use client";

import { useState, useTransition } from "react";
import { updateFacility } from "./actions";

interface FacilityEditFormProps {
  facility: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    slotMinutes: number;
    maxAdvDays: number;
    capacity: number;
    maxBookingsPerUser: number;
    minCancelMinutes: number;
    requiresApproval: boolean;
  };
}

export function FacilityEditForm({ facility }: FacilityEditFormProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateFacility(facility.id, {
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? ""),
        location: String(form.get("location") ?? ""),
        slotMinutes: Number(form.get("slotMinutes")),
        maxAdvDays: Number(form.get("maxAdvDays")),
        capacity: Number(form.get("capacity")),
        maxBookingsPerUser: Number(form.get("maxBookingsPerUser")),
        minCancelMinutes: Number(form.get("minCancelMinutes")),
        requiresApproval: form.get("requiresApproval") === "on",
      });
      setResult(res);
    });
  };

  const inputClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      )}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Facility updated</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <input id="name" name="name" defaultValue={facility.name} required className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={facility.description ?? ""}
            rows={2}
            className={`${inputClass} min-h-[72px] py-2`}
          />
        </div>
        <div>
          <label htmlFor="location" className="text-sm font-medium">
            Location
          </label>
          <input id="location" name="location" defaultValue={facility.location ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="slotMinutes" className="text-sm font-medium">
            Slot duration (minutes)
          </label>
          <input
            id="slotMinutes"
            name="slotMinutes"
            type="number"
            min={15}
            step={15}
            defaultValue={facility.slotMinutes}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="maxAdvDays" className="text-sm font-medium">
            Max advance days
          </label>
          <input
            id="maxAdvDays"
            name="maxAdvDays"
            type="number"
            min={1}
            defaultValue={facility.maxAdvDays}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="capacity" className="text-sm font-medium">
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={facility.capacity}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="maxBookingsPerUser" className="text-sm font-medium">
            Max bookings per user
          </label>
          <input
            id="maxBookingsPerUser"
            name="maxBookingsPerUser"
            type="number"
            min={1}
            defaultValue={facility.maxBookingsPerUser}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="minCancelMinutes" className="text-sm font-medium">
            Min cancel notice (minutes)
          </label>
          <input
            id="minCancelMinutes"
            name="minCancelMinutes"
            type="number"
            min={0}
            defaultValue={facility.minCancelMinutes}
            required
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <input
            id="requiresApproval"
            name="requiresApproval"
            type="checkbox"
            defaultChecked={facility.requiresApproval}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="requiresApproval" className="text-sm font-medium">
            Requires leader approval before booking is confirmed
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
