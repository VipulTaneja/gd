"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InlineAlert } from "@/components/shared/inline-alert";

export function DeleteFileButton({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = () => {
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete file");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      {error && <InlineAlert className="mb-2">{error}</InlineAlert>}
      <button
        disabled={pending}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "..." : "Delete"}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this file?"
        description="This removes the document from the society file vault."
        confirmLabel="Delete"
        onConfirm={remove}
        pending={pending}
      />
    </>
  );
}
