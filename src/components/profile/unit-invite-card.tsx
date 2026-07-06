"use client";

import { useTransition } from "react";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnitRole } from "@/generated/prisma/enums";

export interface PendingUnitInvite {
  id: string;
  requestedRole: UnitRole;
  unit: { unitNumber: string };
  invitedBy: { name: string } | null;
  expiresAt: string | null;
}

interface UnitInviteCardProps {
  invites: PendingUnitInvite[];
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
}

export function UnitInviteCard({ invites, onAccept, onDecline }: UnitInviteCardProps) {
  const [pending, startTransition] = useTransition();

  if (invites.length === 0) return null;

  return (
    <div className="rounded-xl border border-gold/30 bg-gold/5 p-6 space-y-4">
      <h3 className="font-heading text-lg font-semibold">Unit invitations</h3>
      {invites.map((inv) => (
        <div key={inv.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div>
            <p className="font-medium">
              Join unit {inv.unit.unitNumber} as{" "}
              {inv.requestedRole.replace(/_/g, " ").toLowerCase()}
            </p>
            {inv.invitedBy && (
              <p className="text-sm text-muted-foreground">Invited by {inv.invitedBy.name}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await onAccept(inv.id);
                })
              }
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await onDecline(inv.id);
                })
              }
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
