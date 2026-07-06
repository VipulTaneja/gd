"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, ArrowRight } from "lucide-react";

interface SearchResult {
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    globalRole: string;
    unitNumber?: string | null;
  }>;
  units: Array<{
    id: string;
    unitNumber: string;
    block: string;
    floor: number;
    unitType: string;
  }>;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    users: [],
    units: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ users: [], units: [] });
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ users: [], units: [] });
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const navigate = (path: string) => {
    setOpen(false);
    setQuery("");
    router.push(path);
  };

  const hasResults = results.users.length > 0 || results.units.length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 w-full max-w-lg rounded-xl border bg-background shadow-2xl">
            <div className="flex items-center gap-3 border-b px-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users or units..."
                className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
              />
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              )}
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {!hasResults && query.length >= 2 && !loading && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {error ? "Search unavailable. Try again." : "No results found"}
                </p>
              )}

              {results.users.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Users
                  </p>
                  {results.users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => navigate(`/users/${u.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-medium">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {u.unitNumber ?? u.email}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {results.units.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Units
                  </p>
                  {results.units.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => navigate(`/units/${u.unitNumber}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted text-xs font-medium">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{u.unitNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          Tower {u.block}, Floor {u.floor}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
