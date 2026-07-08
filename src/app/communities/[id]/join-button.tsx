"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InlineAlert } from "@/components/shared/inline-alert";

export function JoinCommunityButton({ communityId }: { communityId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleJoin = () => {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/communities/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ communityId }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Failed to send join request");
          return;
        }
        router.refresh();
      } catch {
        setError("Network error — please try again");
      }
    });
  };

  return (
    <div className="space-y-2">
      {error && <InlineAlert>{error}</InlineAlert>}
      <button
        disabled={pending}
        onClick={handleJoin}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? "Requesting..." : "Request to Join"}
      </button>
    </div>
  );
}
