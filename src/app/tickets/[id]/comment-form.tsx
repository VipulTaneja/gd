"use client";

import { useState, useTransition } from "react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { isRichTextEmpty } from "@/lib/rich-text";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRichTextEmpty(body)) {
      setResult({ error: "Comment cannot be empty" });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/tickets/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, body }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) { setBody(""); window.location.reload(); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      <RichTextEditor
        value={body}
        onChange={setBody}
        placeholder="Add a comment…"
        minHeight="120px"
      />
      <button type="submit" disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? "Posting..." : "Add Comment"}
      </button>
    </form>
  );
}
