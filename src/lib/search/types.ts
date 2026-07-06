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

export const NAVIGATION_SHORTCUTS: { keywords: string[]; href: string; label: string }[] = [
  { keywords: ["book", "amenity", "pool", "theatre", "cricket"], href: "/facilities", label: "Book a spot" },
  { keywords: ["ticket", "help", "fix", "repair", "issue"], href: "/tickets/new", label: "Get help" },
  { keywords: ["guest", "visitor", "invite"], href: "/visitors/new", label: "Invite a guest" },
  { keywords: ["due", "payment", "bill"], href: "/dues", label: "View dues" },
  { keywords: ["notice", "announcement", "update"], href: "/notices", label: "What's new" },
  { keywords: ["event", "calendar", "rsvp"], href: "/events", label: "Events" },
  { keywords: ["poll", "vote"], href: "/polls", label: "Polls" },
  { keywords: ["neighbor", "directory", "who"], href: "/directory", label: "Neighbors" },
  { keywords: ["forum", "discussion"], href: "/forums", label: "Forums" },
  { keywords: ["team", "committee", "gdwa"], href: "/team", label: "Meet Our Team" },
  { keywords: ["file", "document", "bylaw"], href: "/files", label: "File vault" },
];
