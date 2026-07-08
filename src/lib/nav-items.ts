import type { FeatureKey } from "@/lib/feature-colors";

/** Desktop header top-level nav links. */
export const headerNav: { feature: FeatureKey; href: string }[] = [
  { feature: "notices", href: "/notices" },
  { feature: "communities", href: "/communities" },
  { feature: "contacts", href: "/contacts" },
  { feature: "staff", href: "/staff" },
  { feature: "team", href: "/team" },
];

/** Icon-only shortcuts on mobile — contacts, regular help, teams. */
export const mobileQuickNav: { feature: FeatureKey; href: string }[] = [
  { feature: "staff", href: "/staff" },
  { feature: "contacts", href: "/contacts" },
  { feature: "communities", href: "/communities" },
];

/** Long-tail links in the mobile bottom nav's "More" sheet. */
export const moreLinks: { feature: FeatureKey; href: string; publicHref?: string }[] = [
  { feature: "notices", href: "/notices" },
  { feature: "events", href: "/events" },
  { feature: "polls", href: "/polls" },
  { feature: "dues", href: "/dues" },
  { feature: "directory", href: "/directory" },
  { feature: "notifications", href: "/notifications" },
  { feature: "forums", href: "/forums" },
  { feature: "communities", href: "/communities" },
  { feature: "staff", href: "/staff" },
  { feature: "contacts", href: "/contacts" },
  { feature: "faq", href: "/faq/app", publicHref: "/faq" },
  { feature: "team", href: "/team" },
];
