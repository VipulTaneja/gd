"use client";

import { useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnitRole } from "@/generated/prisma/enums";
import { UserLink } from "@/components/shared/user-link";

export interface OwnerConsentInvite {
  id: string;
  requestedRole: UnitRole;
  unit: { unitNumber: string };
  user: { id: string; name: string };
  invitedBy: { name: string } | null;
}

interface OwnerConsentCardProps {
  invites: OwnerConsentInvite[];
  onApprove: (id: string) => Promise<void>;
}

export function OwnerConsentCard({ invites, onApprove }: OwnerConsentCardProps) {
  const [pending, startTransition] = useTransition();

  if (invites.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 space-y-4">
      <h3 className="font-heading text-lg font-semibold">Tenant invites — your approval</h3>
      {invites.map((inv) => (
        <div key={inv.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div>
            <p className="font-medium">
              <UserLink userId={inv.user.id} name={inv.user.name} /> → tenant at{" "}
              {inv.unit.unitNumber}
            </p>
            {inv.invitedBy && (
              <p className="text-sm text-muted-foreground">Invited by {inv.invitedBy.name}</p>
            )}
          </div>
          <Button
            size="sm"
            disabled={pending}
            onClick={() => startTransition(async () => onApprove(inv.id))}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Approve tenant invite
          </Button>
        </div>
      ))}
    </div>
  );
}
