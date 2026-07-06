"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Building2, DoorOpen, LifeBuoy, LayoutGrid } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { featureColors, type FeatureKey } from "@/lib/feature-colors";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/facilities",
    label: "Book",
    icon: Building2,
    match: (p: string) => p.startsWith("/facilities"),
  },
  {
    href: "/visitors",
    label: "Guests",
    icon: DoorOpen,
    match: (p: string) => p.startsWith("/visitors"),
  },
  {
    href: "/tickets",
    label: "Help",
    icon: LifeBuoy,
    match: (p: string) => p.startsWith("/tickets"),
  },
];

const moreLinks: { feature: FeatureKey; href: string }[] = [
  { feature: "notices", href: "/notices" },
  { feature: "events", href: "/events" },
  { feature: "polls", href: "/polls" },
  { feature: "dues", href: "/dues" },
  { feature: "directory", href: "/directory" },
  { feature: "notifications", href: "/notifications" },
  { feature: "forums", href: "/forums" },
];

interface MobileBottomNavProps {
  isAuthenticated?: boolean;
}

export function MobileBottomNav({ isAuthenticated = true }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const isMoreActive = !tabs.some(({ match }) => match(pathname)) && pathname !== "/";

  const getHref = (href: string) =>
    isAuthenticated ? href : `/login?callbackUrl=${encodeURIComponent(href)}`;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/90 backdrop-blur-lg md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-14 items-stretch justify-around px-1">
          {tabs.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={getHref(href)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-h-[44px]",
                  active ? "text-gold-dark" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                    active && "bg-gold/15 scale-105"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", active && "stroke-[2.5px]")}
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                </span>
                <span>{label}</span>
              </Link>
            );
          })}

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-h-[44px]",
                isMoreActive ? "text-gold-dark" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all",
                  isMoreActive && "bg-gold/15 scale-105"
                )}
              >
                <LayoutGrid
                  className={cn("h-5 w-5", isMoreActive && "stroke-[2.5px]")}
                  strokeWidth={isMoreActive ? 2.5 : 1.75}
                />
              </span>
              <span>More</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>{isAuthenticated ? "More" : "Sign in to explore"}</SheetTitle>
              </SheetHeader>
              <nav className="mt-2 grid grid-cols-3 gap-1 pb-4">
                {moreLinks.map(({ feature, href }) => {
                  const style = featureColors[feature];
                  if (!style) return null;
                  const { icon: Icon, label } = style;
                  const active = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={feature}
                      href={getHref(href)}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-medium transition-colors",
                        active ? "bg-gold/10 text-gold-dark" : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
