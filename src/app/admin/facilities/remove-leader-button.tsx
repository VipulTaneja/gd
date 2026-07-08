"use client";

import { useState, useTransition } from "react";
import { removeAmenityLeader } from "./actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

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
  const [open, setOpen] = useState(false);

  const remove = () => {
    startTransition(async () => {
      await removeAmenityLeader(facilityId, userId);
      setOpen(false);
    });
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 min-h-11 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 sm:min-h-8"
      >
        {pending ? "..." : "Remove"}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Remove ${userName}?`}
        description="They will no longer be able to manage bookings for this amenity."
        confirmLabel="Remove"
        onConfirm={remove}
        pending={pending}
      />
    </>
  );
}
