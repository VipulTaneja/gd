"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { featureColors, type FeatureKey } from "@/lib/feature-colors";
import type { SearchResultItem, SearchResultGroup } from "@/lib/search/types";
import { FriendlyBadge } from "@/components/shared/friendly-badge";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const typeToFeature: Record<string, FeatureKey> = {
  user: "directory",
  unit: "directory",
  notice: "notices",
  event: "events",
  poll: "polls",
  forum_thread: "forums",
  facility: "facilities",
  community: "communities",
  ticket: "tickets",
  staff: "staff",
  contact: "contacts",
  faq: "directory",
  pet: "directory",
  vehicle: "directory",
  navigation: "home",
};

export function GlobalSearchDialog({ open, onOpenChange, trigger }: GlobalSearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<SearchResultGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allResults = groups.flatMap((g) => g.results);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setGroups([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.status === 401) {
        setError("Please log in to search");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGroups(data.groups || []);
    } catch {
      setGroups([]);
      setError("Search unavailable. Try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (open) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setQuery("");
        setGroups([]);
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (open && e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      navigateTo(allResults[selectedIndex]);
    }
  };

  const navigateTo = (item: SearchResultItem) => {
    onOpenChange(false);
    setQuery("");
    router.push(item.href);
  };

  const totalResults = allResults.length;

  return (
    <>
      {trigger ? (
        <div onClick={() => onOpenChange(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => onOpenChange(true)}
          className="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="ml-1 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative z-50 w-full max-w-lg rounded-2xl border bg-background shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search residents, notices, events, units…"
                className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search"
                aria-autocomplete="list"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2">
              {query.length >= 2 && !loading && totalResults === 0 && !error && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No results found for &ldquo;{query}&rdquo;
                </p>
              )}

              {error && (
                <p className="py-8 text-center text-sm text-rose-500">
                  {error}
                </p>
              )}

              {groups.map((group) => {
                const feature = typeToFeature[group.type] || "home";
                const { icon: Icon, bg, text } = featureColors[feature];

                return (
                  <div key={group.type} className="mb-2">
                    <div className="flex items-center gap-2 px-2 py-1.5">
                      <div className={`flex h-5 w-5 items-center justify-center rounded ${bg}`}>
                        <Icon className={`h-3 w-3 ${text}`} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{group.label}</span>
                    </div>
                    {group.results.map((item) => {
                      const idx = allResults.indexOf(item);
                      return (
                        <button
                          key={`${item.type}-${item.id}`}
                          onClick={() => navigateTo(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            idx === selectedIndex ? "bg-muted" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                            <Icon className={`h-4 w-4 ${text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              {item.priority && item.priority !== "NORMAL" && (
                                <FriendlyBadge value={item.priority} variant="priority" />
                              )}
                            </div>
                            {item.subtitle && (
                              <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                            )}
                          </div>
                          {item.meta && (
                            <span className="text-xs text-muted-foreground shrink-0">{item.meta}</span>
                          )}
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {query.length < 2 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Type to search across notices, events, staff, contacts, FAQ, and more
                </div>
              )}
            </div>

            {/* Footer */}
            {totalResults > 0 && (
              <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{totalResults} result{totalResults !== 1 ? "s" : ""}</span>
                <span>↑↓ navigate · Enter to open · Esc to close</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
