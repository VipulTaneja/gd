"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setUnitLeader } from "./leader-actions";

interface AssignUnitLeaderFormProps {
  unitId: string;
  currentLeader: { id: string; name: string; email: string } | null;
  members: { id: string; name: string; email: string }[];
}

export function AssignUnitLeaderForm({
  unitId,
  currentLeader,
  members,
}: AssignUnitLeaderFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const member = members.find(
      (m) => m.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!member) {
      setError("Email must match an active resident of this unit");
      return;
    }
    startTransition(async () => {
      try {
        await setUnitLeader(unitId, member.id);
        setEmail("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign leader");
      }
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      try {
        await setUnitLeader(unitId, null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove leader");
      }
    });
  }

  return (
    <div className="space-y-3">
      {currentLeader ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="font-medium">{currentLeader.name}</p>
            <p className="text-xs text-muted-foreground">{currentLeader.email}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={handleRemove}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove leader"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No unit leader assigned</p>
      )}
      <form onSubmit={handleAssign} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="leader-email" className="text-sm font-medium">
            Assign leader (unit member email)
          </label>
          <Input
            id="leader-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="resident@example.com"
            className="mt-1"
          />
        </div>
        <Button type="submit" disabled={pending || !email.trim()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
        </Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
