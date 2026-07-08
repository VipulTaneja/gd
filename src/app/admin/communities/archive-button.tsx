"use client";

import { useState, useTransition } from "react";
import { archiveCommunity } from "./actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function ArchiveCommunityButton({ communityId }: { communityId: string }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const archive = () => {
    startTransition(async () => {
      await archiveCommunity(communityId);
      setOpen(false);
    });
  };

  return (
    <>
      <button
        disabled={pending}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "..." : "Archive"}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Archive this community?"
        description="It will be hidden from the directory."
        confirmLabel="Archive"
        onConfirm={archive}
        pending={pending}
      />
    </>
  );
}
