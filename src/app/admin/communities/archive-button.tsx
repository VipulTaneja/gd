"use client";

import { useTransition } from "react";
import { archiveCommunity } from "./actions";

export function ArchiveCommunityButton({ communityId }: { communityId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Archive this community? It will be hidden from the directory.")) {
          startTransition(async () => {
            await archiveCommunity(communityId);
          });
        }
      }}
      className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "..." : "Archive"}
    </button>
  );
}
