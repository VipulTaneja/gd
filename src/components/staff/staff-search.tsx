"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { SearchInput } from "@/components/shared/search-input";
import { UnitLink } from "@/components/shared/unit-link";
import { staffRoleLabel } from "@/lib/staff-labels";
import { staff as staffCopy } from "@/lib/microcopy";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/generated/prisma/enums";

export interface StaffSearchResult {
  id: string;
  name: string;
  roles: StaffRole[];
  units: string[];
  avgRating: number | null;
  reviewCount: number;
}

interface StaffSearchProps {
  onSelect?: (result: StaffSearchResult) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function StaffSearch({ onSelect, placeholder, autoFocus }: StaffSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StaffSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const digits = trimmed.replace(/\D/g, "");
    if (trimmed.length < 2 && digits.length < 10) {
      setResults([]);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/staff/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Search failed");
          setResults([]);
          return;
        }
        setResults(data.results ?? []);
      } catch {
        setError("Network error");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={placeholder ?? staffCopy.searchPlaceholder}
          className="[&_input]:rounded-xl [&_input]:bg-card [&_input]:pr-10 [&_input]:focus-visible:ring-gold"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {results.length > 0 && (
        <ul className="divide-y rounded-xl border bg-card overflow-hidden">
          {results.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => onSelect?.(person)}
                className={cn(
                  "flex w-full flex-col gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50 min-h-11",
                  !onSelect && "cursor-default",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{person.name}</span>
                  {person.avgRating != null && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      {person.avgRating} ({person.reviewCount})
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {person.roles.length > 0 && (
                    <span>{[...new Set(person.roles.map(staffRoleLabel))].join(", ")}</span>
                  )}
                  {person.units.map((unit) => (
                    <UnitLink key={unit} unitNumber={unit} />
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">{staffCopy.noResults}</p>
      )}
    </div>
  );
}
