"use client";

import { useTransition } from "react";

export function AdminStaffReviewActions({
  reviewId,
  isHidden,
}: {
  reviewId: string;
  isHidden: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const toggle = (hide: boolean) => {
    startTransition(async () => {
      await fetch(`/api/admin/staff/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: hide }),
      });
      window.location.reload();
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => toggle(!isHidden)}
      className="min-h-11 shrink-0 rounded-lg border px-3 text-xs"
    >
      {isHidden ? "Unhide" : "Hide"}
    </button>
  );
}
