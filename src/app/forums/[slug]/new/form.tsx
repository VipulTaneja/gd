"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SoftCard } from "@/components/shared/soft-card";
import { Loader2 } from "lucide-react";

export function NewThreadForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError("Title and body are required");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forums/${slug}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), body: body.trim() }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }

        router.push(`/forums/${slug}/${data.id}`);
        router.refresh();
      } catch {
        setError("Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <SoftCard>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-1.5 block w-full rounded-xl border bg-card px-4 py-2.5 text-sm ring-foreground/5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="What's on your mind?"
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {title.length}/120
            </p>
          </div>
          <div>
            <label htmlFor="body" className="text-sm font-medium">
              Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={10000}
              rows={8}
              className="mt-1.5 block w-full rounded-xl border bg-card px-4 py-2.5 text-sm ring-foreground/5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Describe your topic in detail..."
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {body.length.toLocaleString()}/10,000
            </p>
          </div>
          {error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending || !title.trim() || !body.trim()}
            className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-6 text-sm font-semibold text-black transition-colors hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Post Thread"
            )}
          </button>
        </div>
      </SoftCard>
    </form>
  );
}
