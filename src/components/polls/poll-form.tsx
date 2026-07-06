"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";

export function PollForm({ communityId }: { communityId?: string }) {
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
  const [result, setResult] = useState<{ success?: boolean; error?: string; id?: string } | null>(null);

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
      setResult({ error: "At least 2 options required" });
      return;
    }

    startTransition(async () => {
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
      const data = await res.json();
      setResult(data);
      if (data.success) {
        setTitle("");
        setDescription("");
        setOptions(["", ""]);
        setOpensAt("");
        setClosesAt("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Poll created! <a href={`/polls/${result.id}`} className="underline">View poll</a>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
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
              <input type="text" value={opt} onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex h-9 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-input px-2 text-sm text-muted-foreground hover:bg-muted">✕</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption}
          className="text-sm text-gold hover:underline">+ Add option</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Opens At</label>
          <input type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Closes At</label>
          <input type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} required
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Eligibility</label>
          <select value={eligibility} onChange={(e) => setEligibility(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            <option value="ALL_RESIDENTS">All Residents</option>
            <option value="OWNERS_ONLY">Owners Only</option>
            <option value="ONE_PER_UNIT">One Per Unit</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Max Choices</label>
          <input type="number" min={1} value={maxChoices} onChange={(e) => setMaxChoices(parseInt(e.target.value) || 1)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Results Visibility</label>
        <select value={resultVisibility} onChange={(e) => setResultVisibility(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          <option value="LIVE">Live</option>
          <option value="AFTER_CLOSE">After Close</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded border-input" />
          Anonymous voting
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isResolution} onChange={(e) => setIsResolution(e.target.checked)} className="h-4 w-4 rounded border-input" />
          RWA Resolution
        </label>
      </div>

      {isResolution && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Quorum %</label>
          <input type="number" min={1} max={100} value={quorumPercentage} onChange={(e) => setQuorumPercentage(e.target.value)}
            placeholder="e.g. 51"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
        </div>
      )}

      <button type="submit" disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
        ) : (
          "Create Poll"
        )}
      </button>
    </form>
  );
}
