"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, Home, MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchResult {
  users: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    unitNumber: string | null;
  }[];
  units: {
    id: string;
    unitNumber: string;
    block: string;
  }[];
  threads: {
    id: string;
    title: string;
    forumSlug: string;
    forumName: string;
    author: { id: string; name: string };
    createdAt: string;
    replyCount: number;
    href: string;
  }[];
}

export function MobileSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setQuery(""); setResults(null); } }}>
      <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors md:hidden">
        <Search className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="top" className="pt-[env(safe-area-inset-top)]">
        <SheetHeader>
          <SheetTitle>Search</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search residents or units..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); search(e.target.value); }}
            autoFocus
            className="w-full rounded-lg border bg-background px-4 py-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        {loading && (
          <p className="mt-4 text-sm text-muted-foreground text-center">Searching...</p>
        )}
        {results && !loading && (
          <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto">
            {results.users.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Residents</p>
                <div className="space-y-1">
                  {results.users.map((u) => (
                    <Link
                      key={u.id}
                      href={`/users/${u.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        {u.avatarUrl && <AvatarImage src={u.avatarUrl} alt={u.name} />}
                        <AvatarFallback className="text-xs">
                          {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.unitNumber ?? u.email}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.units.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Units</p>
                <div className="space-y-1">
                  {results.units.map((u) => (
                    <Link
                      key={u.id}
                      href={`/units/${u.unitNumber}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold text-xs font-bold">
                        <Home className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{u.unitNumber}</p>
                        <p className="text-xs text-muted-foreground">Tower {u.block}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.users.length === 0 && results.units.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
