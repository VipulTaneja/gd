"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserLink } from "@/components/shared/user-link";
import { ApproveRejectButtons } from "@/components/shared/approve-reject-buttons";
import { handleJoinRequest } from "@/app/admin/communities/actions";

type PendingRequest = {
  id: string;
  user: { id: string; name: string };
  createdAt: Date;
};

export function CommunityLeaderPanel({
  communityId,
  communityName,
  isTower,
  pendingRequests,
}: {
  communityId: string;
  communityName: string;
  isTower: boolean;
  pendingRequests: PendingRequest[];
}) {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-6 dark:border-purple-900 dark:bg-purple-950/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold">Community Leader</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage {communityName} — post updates and moderate membership.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/events/new?communityId=${communityId}`}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light"
          >
            Create event
          </Link>
          <Link
            href={`/polls/new?communityId=${communityId}`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Create poll
          </Link>
          <Link
            href={`/communities/${communityId}/notices/new`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Post update
          </Link>
        </div>
      </div>

      {!isTower && pendingRequests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3">
            Pending join requests ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <JoinRequestActions key={req.id} request={req} />
            ))}
          </div>
        </div>
      )}

      {isTower && (
        <p className="mt-4 text-sm text-muted-foreground">
          Tower membership is automatic — use content tools above for announcements and events.
        </p>
      )}
    </div>
  );
}

function JoinRequestActions({ request }: { request: PendingRequest }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const process = (approve: boolean) => {
    setError(null);
    startTransition(async () => {
      const result = await handleJoinRequest(request.id, approve);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <UserLink userId={request.user.id} name={request.user.name} className="font-medium text-sm" />
        <p className="text-xs text-muted-foreground">
          Requested {request.createdAt.toLocaleDateString()}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <ApproveRejectButtons pending={pending} onApprove={() => process(true)} onReject={() => process(false)} />
    </div>
  );
}
