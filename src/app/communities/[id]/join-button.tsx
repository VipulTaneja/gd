"use client";

import { useTransition } from "react";

export function JoinCommunityButton({ communityId }: { communityId: string }) {
  const [pending, startTransition] = useTransition();

  const handleJoin = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/communities/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ communityId }),
        });
        if (res.ok) {
          window.location.reload();
        }
      } catch {
        // handle error
      }
    });
  };

  return (
    <button
      disabled={pending}
      onClick={handleJoin}
      className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
    >
      {pending ? "Requesting..." : "Request to Join"}
    </button>
  );
}
