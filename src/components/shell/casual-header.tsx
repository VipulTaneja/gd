"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, LogOut, User, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalSearchDialog } from "@/components/shared/global-search-dialog";
import { CountBadge } from "@/components/shared/count-badge";
import { featureColors, type FeatureKey } from "@/lib/feature-colors";
import { headerNav, mobileQuickNav } from "@/lib/nav-items";
import { nav, actions } from "@/lib/microcopy";
import { cn } from "@/lib/utils";

function isNavActive(
  feature: FeatureKey,
  href: string,
  pathname: string,
): boolean {
  if (feature === "staff") {
    return pathname === "/staff" || pathname.startsWith("/staff/");
  }
  const base = href.split("?")[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}

interface CasualHeaderProps {
  user: { name: string; email: string; id?: string; avatarUrl?: string | null } | null;
  unreadCount?: number;
}

export function CasualHeader({ user, unreadCount: unreadProp }: CasualHeaderProps) {
  const pathname = usePathname();
  const unreadCount = unreadProp ?? 0;
  const [searchOpen, setSearchOpen] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "";

  const renderNavLink = (
    { feature, href }: { feature: FeatureKey; href: string },
    opts?: { iconOnly?: boolean },
  ) => {
    const { icon: Icon, label, bg, text } = featureColors[feature];
    const active = isNavActive(feature, href, pathname);
    return (
      <Link
        key={href}
        href={href}
        aria-label={label}
        title={label}
        className={cn(
          "flex items-center gap-1.5 rounded-full transition-all",
          opts?.iconOnly
            ? "min-h-11 min-w-11 justify-center"
            : "px-3 py-1.5 text-sm font-medium",
          active
            ? cn(bg, text, "shadow-sm")
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!opts?.iconOnly && <span className="whitespace-nowrap">{label}</span>}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="rounded-lg bg-zinc-800 px-3 py-2">
            <Image
              src="/logo.webp"
              alt="Gulshan Dynasty"
              width={164}
              height={45}
              className="h-10 w-auto"
              priority
            />
          </div>
        </Link>

        {/* Mobile: regular help, contacts, forums */}
        <nav className="flex md:hidden items-center gap-0.5">
          {mobileQuickNav.map((item) => renderNavLink(item, { iconOnly: true }))}
        </nav>

        {/* Desktop: full header nav */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {headerNav.map((item) => renderNavLink(item))}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <GlobalSearchDialog
            open={searchOpen}
            onOpenChange={setSearchOpen}
            trigger={
              <button
                className="flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="ml-1 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </button>
            }
          />
          {user ? (
            <>
              <Link
                href="/notifications"
                aria-label={nav.notifications}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <CountBadge count={unreadCount} size="sm" />}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-full pl-1 pr-2 hover:bg-muted transition-colors">
                  <Avatar size="sm">
                    {user.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    )}
                    <AvatarFallback className="bg-gold/15 text-gold-dark text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem render={<Link href={user.id ? `/users/${user.id}` : "/profile"} />}>
                    <User className="h-4 w-4 mr-2" /> {nav.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/directory" />}>
                    {nav.directory}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/api/auth/signout" />}>
                    <LogOut className="h-4 w-4 mr-2" /> {actions.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-black hover:bg-gold-light transition-colors"
            >
              {actions.signIn}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
