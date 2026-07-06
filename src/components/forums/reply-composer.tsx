"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { isRichTextEmpty } from "@/lib/rich-text";

interface ReplyComposerProps {
  threadId: string;
}

export function ReplyComposer({ threadId }: ReplyComposerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isRichTextEmpty(body)) {
      setError("Reply cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/forums/threads/${threadId}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
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
      <RichTextEditor
        value={body}
        onChange={setBody}
        placeholder="Write a reply…"
        minHeight="120px"
      />

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending || isRichTextEmpty(body)}
          className="inline-flex h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-black transition-colors hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed"
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
