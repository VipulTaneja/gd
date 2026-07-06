"use client";

import { useState, useTransition } from "react";

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
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

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
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionIds: selected }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) window.location.reload();
    });
  };

  if (result?.error) {
    return <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>;
  }

  return (
    <div className="space-y-3">
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
