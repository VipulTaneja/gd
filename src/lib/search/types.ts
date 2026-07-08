export type SearchResultType =
  | "user"
  | "unit"
  | "notice"
  | "event"
  | "poll"
  | "forum_thread"
  | "facility"
  | "file"
  | "community"
  | "ticket"
  | "staff"
  | "contact"
  | "faq"
  | "pet"
  | "vehicle"
  | "lost_found"
  | "navigation";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
  meta?: string;
  priority?: "EMERGENCY" | "IMPORTANT" | "NORMAL";
}

export interface SearchResultGroup {
  type: SearchResultType;
  label: string;
  results: SearchResultItem[];
}

export interface GlobalSearchResponse {
  query: string;
  groups: SearchResultGroup[];
}

export function stripHtmlForSearch(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function normalizeUnitQuery(input: string): string | null {
  const cleaned = input.replace(/[\s\-]/g, "").toUpperCase();
  const match = cleaned.match(/^([ABC])(\d{3,4})$/);
  if (!match) return null;
  const tower = match[1];
  const num = match[2].padStart(4, "0");
  return `${tower}-${num}`;
}

import { nav } from "@/lib/microcopy";

export const NAVIGATION_SHORTCUTS: { keywords: string[]; href: string; label: string }[] = [
  { keywords: ["book", "amenity", "pool", "theatre", "cricket"], href: "/facilities", label: nav.facilities },
  { keywords: ["ticket", "help", "fix", "repair", "issue"], href: "/tickets/new", label: nav.tickets },
  { keywords: ["guest", "visitor", "invite"], href: "/visitors/new", label: nav.visitors },
  { keywords: ["due", "payment", "bill"], href: "/dues", label: nav.dues },
  { keywords: ["notice", "announcement", "update"], href: "/notices", label: nav.notices },
  { keywords: ["event", "calendar", "rsvp"], href: "/events", label: nav.events },
  { keywords: ["poll", "vote"], href: "/polls", label: nav.polls },
  { keywords: ["neighbor", "directory", "who"], href: "/directory", label: nav.directory },
  { keywords: ["forum", "discussion"], href: "/forums", label: "Forums" },
  { keywords: ["team", "committee", "gdwa"], href: "/team", label: "Our Team" },
  { keywords: ["file", "document", "bylaw"], href: "/files", label: "Documents" },
  { keywords: ["maid", "cook", "guard", "regular help", "staff"], href: "/visitors?tab=help", label: nav.regularHelp },
  { keywords: ["contact", "vendor", "electrician", "plumber", "phone"], href: "/contacts", label: nav.contacts },
  { keywords: ["faq", "question", "how to"], href: "/faq", label: "Help & FAQ" },
];
