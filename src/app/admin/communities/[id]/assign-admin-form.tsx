"use client";

import { useState, useTransition } from "react";
import { assignCommunityAdmin } from "../actions";

export function AssignAdminForm({ communityId }: { communityId: string }) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await assignCommunityAdmin(communityId, email);
      setResult(res);
      if (res.success) setEmail("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      {result?.error && (
        <div className="w-full rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      )}
      {result?.success && (
        <div className="w-full rounded-lg bg-green-50 p-3 text-sm text-green-800">Admin assigned</div>
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="User email"
        required
        className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? "..." : "Assign Admin"}
      </button>
    </form>
  );
}
