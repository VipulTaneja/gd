"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ReplyComposer({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!body.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forums/threads/${threadId}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: body.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }

        setBody("");
        router.refresh();
      } catch {
        setError("Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={10000}
        rows={3}
        className="block w-full rounded-xl border bg-card px-4 py-2.5 text-sm ring-foreground/5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        placeholder="Write a reply..."
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {body.length.toLocaleString()}/10,000
        </span>
        <button
          type="submit"
          disabled={isPending || !body.trim()}
          className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-black transition-colors hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Reply"
          )}
        </button>
      </div>
    </form>
  );
}
