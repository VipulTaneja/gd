"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { featureColors, type FeatureKey } from "@/lib/feature-colors";
import { cn } from "@/lib/utils";

const navItems: { feature: FeatureKey; href: string }[] = [
  { feature: "notices", href: "/notices" },
  { feature: "events", href: "/events" },
  { feature: "polls", href: "/polls" },
  { feature: "forums", href: "/forums" },
  { feature: "tickets", href: "/tickets" },
  { feature: "facilities", href: "/facilities" },
  { feature: "visitors", href: "/visitors" },
  { feature: "dues", href: "/dues" },
  { feature: "directory", href: "/directory" },
];

export function HorizontalNavPills() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
      {navItems.map(({ feature, href }) => {
        const { icon: Icon, label, bg, text } = featureColors[feature];
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap shrink-0",
              active
                ? cn(bg, text, "shadow-sm")
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
