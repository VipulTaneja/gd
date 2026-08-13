"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { InlineAlert } from "@/components/shared/inline-alert";

export function PollForm({ communityId }: { communityId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [opensAt, setOpensAt] = useState(new Date().toISOString().slice(0, 16));
  const [closesAt, setClosesAt] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [resultVisibility, setResultVisibility] = useState("LIVE");
  const [maxChoices, setMaxChoices] = useState(1);
  const [eligibility, setEligibility] = useState("ALL_RESIDENTS");
  const [isResolution, setIsResolution] = useState(false);
  const [quorumPercentage, setQuorumPercentage] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => {
    const next = [...options];
    next[i] = val;
    setOptions(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      setError("At least 2 options required");
      return;
    }
    if (!closesAt) {
      setError("Close date is required");
      return;
    }
    if (new Date(closesAt) <= new Date(opensAt)) {
      setError("Close date must be after the open date");
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/polls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            options: validOptions,
            opensAt,
            closesAt,
            scope: communityId ? "SUB_COMMUNITY" : "GLOBAL",
            subCommunityId: communityId,
            isAnonymous,
            resultVisibility,
            maxChoices,
            eligibility,
            isResolution,
            quorumPercentage: quorumPercentage ? parseInt(quorumPercentage) : null,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          setError(data.error ?? "Failed to create poll");
          return;
        }
        router.push(data.id ? `/polls/${data.id}` : "/polls");
        router.refresh();
      } catch {
        setError("Network error — check your connection and try again");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <InlineAlert>{error}</InlineAlert>}

      <div className="space-y-1.5">
        <label htmlFor="poll-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="poll-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Description</label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Explain what this vote is about…"
          minHeight="120px"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Options</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex h-11 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-input px-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption} className="text-sm text-gold hover:underline">
          + Add option
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="poll-opens" className="text-sm font-medium">
            Opens At
          </label>
          <input
            id="poll-opens"
            type="datetime-local"
            value={opensAt}
            onChange={(e) => setOpensAt(e.target.value)}
            required
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="poll-closes" className="text-sm font-medium">
            Closes At
          </label>
          <input
            id="poll-closes"
            type="datetime-local"
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            required
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="poll-eligibility" className="text-sm font-medium">
            Eligibility
          </label>
          <select
            id="poll-eligibility"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          >
            <option value="ALL_RESIDENTS">All Residents</option>
            <option value="OWNERS_ONLY">Owners Only</option>
            <option value="ONE_PER_UNIT">One Per Unit</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="poll-max-choices" className="text-sm font-medium">
            Max Choices
          </label>
          <input
            id="poll-max-choices"
            type="number"
            min={1}
            value={maxChoices}
            onChange={(e) => setMaxChoices(parseInt(e.target.value) || 1)}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="poll-visibility" className="text-sm font-medium">
          Results Visibility
        </label>
        <select
          id="poll-visibility"
          value={resultVisibility}
          onChange={(e) => setResultVisibility(e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
        >
          <option value="LIVE">Live</option>
          <option value="AFTER_CLOSE">After Close</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Anonymous voting
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isResolution}
            onChange={(e) => setIsResolution(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          RWA Resolution
        </label>
      </div>

      {isResolution && (
        <div className="space-y-1.5">
          <label htmlFor="poll-quorum" className="text-sm font-medium">
            Quorum %
          </label>
          <input
            id="poll-quorum"
            type="number"
            min={1}
            max={100}
            value={quorumPercentage}
            onChange={(e) => setQuorumPercentage(e.target.value)}
            placeholder="e.g. 51"
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
          </>
        ) : (
          "Create Poll"
        )}
      </button>
    </form>
  );
}
