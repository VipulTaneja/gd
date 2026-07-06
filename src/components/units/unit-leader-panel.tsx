"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UnitRole } from "@/generated/prisma/enums";

interface SearchUser {
  id: string;
  name: string;
  unitNumber: string | null;
  unitCount?: number;
}

interface PendingInvite {
  id: string;
  requestedRole: UnitRole;
  user: { id: string; name: string };
  createdAt: string;
}

interface UnitLeaderPanelProps {
  unitId: string;
  unitNumber: string;
  pendingInvites: PendingInvite[];
  onSearch: (query: string) => Promise<SearchUser[]>;
  onInvite: (userId: string, role: UnitRole) => Promise<void>;
  onCancel: (requestId: string) => Promise<void>;
}

const INVITE_ROLES: { value: UnitRole; label: string }[] = [
  { value: "TENANT", label: "Tenant" },
  { value: "OWNER_FAMILY", label: "Owner family" },
  { value: "TENANT_FAMILY", label: "Tenant family" },
];

export function UnitLeaderPanel({
  unitNumber,
  pendingInvites,
  onSearch,
  onInvite,
  onCancel,
}: UnitLeaderPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [role, setRole] = useState<UnitRole>("TENANT");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSearch() {
    setError(null);
    startTransition(async () => {
      try {
        const users = await onSearch(query.trim());
        setResults(users);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      }
    });
  }

  function handleInvite(userId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await onInvite(userId, role);
        setResults([]);
        setQuery("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invite failed");
      }
    });
  }

  function handleCancel(requestId: string) {
    startTransition(async () => {
      try {
        await onCancel(requestId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Cancel failed");
      }
    });
  }

  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div>
        <h3 className="font-heading text-lg font-semibold">Unit leader</h3>
        <p className="text-sm text-muted-foreground">
          Invite residents to {unitNumber}. They accept from their profile.
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Pending invites</p>
          {pendingInvites.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-lg border p-3 text-sm"
            >
              <div>
                <p className="font-medium">{inv.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {inv.requestedRole.replace(/_/g, " ")} ·{" "}
                  {new Date(inv.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => handleCancel(inv.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="invite-search" className="text-sm font-medium">
            Search by name
          </label>
          <Input
            id="invite-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Resident name"
            className="mt-1"
          />
        </div>
        <Select value={role} onValueChange={(v) => setRole(v as UnitRole)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INVITE_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" disabled={pending || query.length < 2} onClick={handleSearch}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border p-3 text-sm"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                {u.unitNumber && (
                  <p className="text-xs text-muted-foreground">Unit {u.unitNumber}</p>
                )}
                {(u.unitCount ?? 0) > 1 && (
                  <p className="text-xs text-amber-700">
                    Already linked to {u.unitCount} units — confirm role is correct
                  </p>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                disabled={pending}
                onClick={() => handleInvite(u.id)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Invite
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
