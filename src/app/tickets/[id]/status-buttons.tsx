"use client";

import { useTransition } from "react";

const transitions: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "CLOSED"],
  IN_PROGRESS: ["RESOLVED", "CLOSED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

export function StatusButtons({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const [pending, startTransition] = useTransition();

  const updateStatus = (status: string) => {
    startTransition(async () => {
      await fetch("/api/tickets/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status }),
      });
      window.location.reload();
    });
  };

  const nextStatuses = transitions[currentStatus] || [];

  return (
    <div className="flex flex-wrap gap-2">
      {nextStatuses.map((status) => (
        <button key={status} disabled={pending} onClick={() => updateStatus(status)}
          className={`inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            status === "IN_PROGRESS" ? "bg-amber-500 hover:bg-amber-600" :
            status === "RESOLVED" ? "bg-green-600 hover:bg-green-700" :
            "bg-gray-500 hover:bg-gray-600"
          }`}>
          {status.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}
