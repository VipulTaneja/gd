"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { InlineAlert } from "@/components/shared/inline-alert";
import { isRichTextEmpty } from "@/lib/rich-text";

export function CommentForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRichTextEmpty(body)) {
      setError("Comment cannot be empty");
      return;
    }
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/tickets/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, body }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to post comment");
        return;
      }
      setBody("");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <InlineAlert>{error}</InlineAlert>}
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
