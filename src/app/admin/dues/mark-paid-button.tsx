"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useJsonMutation } from "@/lib/client-api";

export function MarkPaidButton({ dueId }: { dueId: string }) {
  const { pending, refresh, apiCall, startTransition } = useJsonMutation();
  const [open, setOpen] = useState(false);

  const markPaid = () => {
    startTransition(async () => {
      await apiCall("/api/dues/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueId }),
      });
      setOpen(false);
      refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center justify-center rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Mark Paid"}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Mark as paid?"
        description="This records the due as paid for this unit."
        confirmLabel="Mark paid"
        onConfirm={markPaid}
        pending={pending}
        destructive={false}
      />
    </>
  );
}
