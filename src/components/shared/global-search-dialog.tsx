"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2, Home as HomeIcon, PawPrint, Car, X, type LucideIcon } from "lucide-react";
import { featureColors } from "@/lib/feature-colors";
import type { SearchResultItem, SearchResultGroup } from "@/lib/search/types";
import { FriendlyBadge } from "@/components/shared/friendly-badge";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

interface SearchTypeStyle {
  icon: LucideIcon;
  bg: string;
  text: string;
}

const searchTypeStyles: Record<string, SearchTypeStyle> = {
  user: featureColors.directory,
  unit: { icon: HomeIcon, bg: "bg-indigo-100", text: "text-indigo-700" },
  notice: featureColors.notices,
  event: featureColors.events,
  poll: featureColors.polls,
  forum_thread: featureColors.forums,
  facility: featureColors.facilities,
  community: featureColors.communities,
  ticket: featureColors.tickets,
  staff: featureColors.staff,
  contact: featureColors.contacts,
  faq: featureColors.faq,
  pet: { icon: PawPrint, bg: "bg-green-100", text: "text-green-700" },
  vehicle: { icon: Car, bg: "bg-orange-100", text: "text-orange-700" },
  navigation: featureColors.home,
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
  const latestRequestId = useRef(0);

  const search = useCallback(async (q: string) => {
    const requestId = ++latestRequestId.current;

    if (q.length < 2) {
      setGroups([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (requestId !== latestRequestId.current) return;
      if (res.status === 401) {
        setError("Please log in to search");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (requestId !== latestRequestId.current) return;
      setGroups(data.groups || []);
    } catch {
      if (requestId !== latestRequestId.current) return;
      setGroups([]);
      setError("Search unavailable. Try again.");
    }
    if (requestId === latestRequestId.current) setLoading(false);
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
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:pt-[15vh] sm:px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in-up"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative z-50 flex h-full w-full flex-col overflow-hidden bg-background shadow-2xl animate-fade-in-up sm:h-auto sm:max-w-lg sm:rounded-2xl sm:border">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b px-4 pt-[env(safe-area-inset-top)] sm:pt-0">
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
              <button
                onClick={() => onOpenChange(false)}
                className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground sm:hidden"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2 sm:max-h-80 sm:flex-none">
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
                const { icon: Icon, bg, text } = searchTypeStyles[group.type] ?? featureColors.home;

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
