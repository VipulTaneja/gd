"use client";

import { useJsonMutation } from "@/lib/client-api";

export function AdminStaffReviewActions({
  reviewId,
  isHidden,
}: {
  reviewId: string;
  isHidden: boolean;
}) {
  const { pending, error, setError, refresh, apiCall, startTransition } = useJsonMutation();

  const toggle = (hide: boolean) => {
    setError(null);
    startTransition(async () => {
      try {
        await apiCall(`/api/admin/staff/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isHidden: hide }),
        });
        refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update review");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle(!isHidden)}
        className="min-h-11 shrink-0 rounded-lg border px-3 text-xs"
      >
        {isHidden ? "Unhide" : "Hide"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
