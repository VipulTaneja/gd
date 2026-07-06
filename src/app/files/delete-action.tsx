"use client";

import { useTransition } from "react";

export function DeleteFileButton({ fileId }: { fileId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this file?")) {
          startTransition(async () => {
            await fetch("/api/files/delete", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileId }),
            });
            window.location.reload();
          });
        }
      }}
      className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "..." : "Delete"}
    </button>
  );
}
