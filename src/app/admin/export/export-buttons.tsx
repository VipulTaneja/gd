"use client";

import { useTransition } from "react";
import { exportMembers, exportDues, exportTickets } from "./actions";
import { Download } from "lucide-react";

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons() {
  const [pending, startTransition] = useTransition();

  const handleExport = async (fn: () => Promise<string>, filename: string) => {
    startTransition(async () => {
      const csv = await fn();
      downloadCsv(csv, filename);
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        disabled={pending}
        onClick={() => handleExport(exportMembers, "members.csv")}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Members CSV
      </button>
      <button
        disabled={pending}
        onClick={() => handleExport(exportDues, "dues.csv")}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Dues CSV
      </button>
      <button
        disabled={pending}
        onClick={() => handleExport(exportTickets, "tickets.csv")}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-input px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        Tickets CSV
      </button>
    </div>
  );
}
