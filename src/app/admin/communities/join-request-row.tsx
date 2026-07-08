"use client";

import { useTransition } from "react";
import { UserLink } from "@/components/shared/user-link";
import { ApproveRejectButtons } from "@/components/shared/approve-reject-buttons";
import { handleJoinRequest } from "./actions";

interface JoinRequestRowProps {
  request: {
    id: string;
    user: { id: string; name: string; email: string };
    subCommunity: { name: string };
  };
}

export function JoinRequestRow({ request }: JoinRequestRowProps) {
  const [pending, startTransition] = useTransition();

  const process = (approve: boolean) => {
    startTransition(async () => {
      await handleJoinRequest(request.id, approve);
    });
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <UserLink userId={request.user.id} name={request.user.name} className="font-medium" />
        <p className="text-xs text-muted-foreground">
          wants to join <strong>{request.subCommunity.name}</strong>
        </p>
      </div>
      <ApproveRejectButtons pending={pending} onApprove={() => process(true)} onReject={() => process(false)} size="sm" />
    </div>
  );
}
