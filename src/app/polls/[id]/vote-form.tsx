"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InlineAlert } from "@/components/shared/inline-alert";
import { SuccessAnimation } from "@/components/shared/success-animation";

interface Option {
  id: string;
  label: string;
  order: number;
}

export function VoteForm({
  pollId,
  options,
  maxChoices,
}: {
  pollId: string;
  options: Option[];
  maxChoices: number;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggle = (optionId: string) => {
    if (maxChoices === 1) {
      setSelected([optionId]);
    } else {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : prev.length < maxChoices
          ? [...prev, optionId]
          : prev,
      );
    }
  };

  const handleVote = () => {
    if (selected.length === 0) return;
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionIds: selected }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to submit vote");
        return;
      }
      setShowSuccess(true);
    });
  };

  if (showSuccess) {
    return (
      <SuccessAnimation
        message="Vote recorded!"
        onComplete={() => {
          setShowSuccess(false);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && <InlineAlert>{error}</InlineAlert>}
      <p className="text-sm text-muted-foreground">
        Select {maxChoices === 1 ? "one option" : `up to ${maxChoices} options`}
      </p>
      {options.map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
            selected.includes(opt.id) ? "border-gold bg-gold/5" : "hover:bg-muted/50"
          }`}
        >
          <input
            type={maxChoices === 1 ? "radio" : "checkbox"}
            name="poll-option"
            checked={selected.includes(opt.id)}
            onChange={() => toggle(opt.id)}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium">{opt.label}</span>
        </label>
      ))}
      <button
        onClick={handleVote}
        disabled={pending || selected.length === 0}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit Vote"}
      </button>
    </div>
  );
}
