"use client";

import { useTransition } from "react";
import { removeAmenityLeader } from "./actions";

export function RemoveLeaderButton({
  facilityId,
  userId,
  userName,
}: {
  facilityId: string;
  userId: string;
  userName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Remove ${userName} as amenity leader?`)) return;
        startTransition(async () => {
          await removeAmenityLeader(facilityId, userId);
        });
      }}
      className="inline-flex h-8 min-h-11 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 sm:min-h-8"
    >
      {pending ? "..." : "Remove"}
    </button>
  );
}
