"use client";

import { useState, useTransition } from "react";
import { transferOwnership } from "./actions";

export function TransferOwnershipButton({ unitId }: { unitId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleTransfer = () => {
    startTransition(async () => {
      const res = await transferOwnership(unitId, email);
      setResult(res);
      if (res.success) {
        setOpen(false);
        setEmail("");
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted"
      >
        Transfer Ownership
      </button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <p className="text-sm font-medium">Transfer Ownership</p>
      <p className="text-xs text-muted-foreground">
        This will close the current owner&apos;s membership and create a new one for the new owner.
      </p>
      {result?.error && (
        <div className="rounded bg-red-50 p-2 text-xs text-red-800">{result.error}</div>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="New owner email"
          className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          onClick={handleTransfer}
          disabled={pending || !email}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
        >
          {pending ? "..." : "Transfer"}
        </button>
        <button
          onClick={() => { setOpen(false); setResult(null); }}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
