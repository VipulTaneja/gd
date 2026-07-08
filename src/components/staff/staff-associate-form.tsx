"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { StaffSearch, type StaffSearchResult } from "@/components/staff/staff-search";
import { staffRoleLabel, RESIDENT_STAFF_ROLES } from "@/lib/staff-labels";
import { staff as staffCopy } from "@/lib/microcopy";
import type { StaffRole } from "@/generated/prisma/enums";

const DAY_OPTIONS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
] as const;

interface UnitOption {
  id: string;
  unitNumber: string;
}

interface StaffAssociateFormProps {
  units: UnitOption[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StaffAssociateForm({ units, onSuccess, onCancel }: StaffAssociateFormProps) {
  const [mode, setMode] = useState<"search" | "create" | "associate">("search");
  const [selected, setSelected] = useState<StaffSearchResult | null>(null);
  const [unitId, setUnitId] = useState(units[0]?.id ?? "");
  const [role, setRole] = useState<StaffRole>("MAID");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [days, setDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI", "SAT"]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSelect = (result: StaffSearchResult) => {
    setSelected(result);
    setMode("associate");
    setError(null);
  };

  const submitCreate = () => {
    if (!name.trim() || !phone.trim() || !unitId) {
      setError("Name, phone, and unit are required");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, role, unitId, recurrenceDays: days }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add staff");
        return;
      }
      onSuccess?.();
    });
  };

  const submitAssociate = () => {
    if (!selected || !unitId) {
      setError("Select a person and unit");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/staff/${selected.id}/associations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, role, recurrenceDays: days }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not link staff");
        return;
      }
      onSuccess?.();
    });
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <h3 className="font-heading text-sm font-semibold">{staffCopy.addHelp}</h3>

      {mode === "search" && (
        <>
          <StaffSearch onSelect={handleSelect} />
          <button
            type="button"
            onClick={() => { setMode("create"); setError(null); }}
            className="text-sm text-gold hover:underline min-h-11 inline-flex items-center"
          >
            Can&apos;t find them? Add as new
          </button>
        </>
      )}

      {(mode === "create" || mode === "associate") && (
        <div className="space-y-3">
          {mode === "associate" && selected && (
            <p className="text-sm">
              Linking <strong>{selected.name}</strong> to your unit
            </p>
          )}

          {mode === "create" && (
            <>
              <div>
                <label htmlFor="staff-name" className="text-xs font-medium text-muted-foreground">Name *</label>
                <input
                  id="staff-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
              </div>
              <div>
                <label htmlFor="staff-phone" className="text-xs font-medium text-muted-foreground">Phone *</label>
                <input
                  id="staff-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                />
              </div>
            </>
          )}

          {units.length > 1 && (
            <div>
              <label htmlFor="staff-unit" className="text-xs font-medium text-muted-foreground">Unit *</label>
              <select
                id="staff-unit"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.unitNumber}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="staff-role" className="text-xs font-medium text-muted-foreground">Role *</label>
            <select
              id="staff-role"
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {RESIDENT_STAFF_ROLES.map((r) => (
                <option key={r} value={r}>{staffRoleLabel(r)}</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="text-xs font-medium text-muted-foreground mb-2">{staffCopy.schedule}</legend>
            <div className="flex flex-wrap gap-2">
              {DAY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleDay(value)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    days.includes(value) ? "bg-gold text-black" : "border border-input hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={mode === "create" ? submitCreate : submitAssociate}
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light disabled:opacity-50"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : staffCopy.addHelp}
            </button>
            <button
              type="button"
              onClick={() => {
                if (mode === "create") setMode("search");
                else onCancel?.();
              }}
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
