"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSearch } from "@/components/shared/mobile-search";
import { featureColors, type FeatureKey } from "@/lib/feature-colors";
import { nav, actions } from "@/lib/microcopy";
import { cn } from "@/lib/utils";

const headerNav: { feature: FeatureKey; href: string }[] = [
  { feature: "notices", href: "/notices" },
  { feature: "events", href: "/events" },
  { feature: "polls", href: "/polls" },
];

interface CasualHeaderProps {
  user: { name: string; email: string; id?: string; avatarUrl?: string | null } | null;
  unreadCount?: number;
}

export function CasualHeader({ user, unreadCount: unreadProp }: CasualHeaderProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(unreadProp ?? 0);

  useEffect(() => {
    if (unreadProp != null) return;
    if (!user) return;
    fetch("/api/notifications/unread")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});
  }, [user, unreadProp]);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="https://www.gulshandynasty.com/images/logo.webp"
            alt="Gulshan Dynasty"
            width={100}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {headerNav.map(({ feature, href }) => {
            const { icon: Icon, label, bg, text } = featureColors[feature];
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
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

        <div className="flex items-center gap-1">
          <MobileSearch />
          {user ? (
            <>
              <Link
                href="/notifications"
                aria-label={nav.notifications}
                className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 animate-badge-pop items-center justify-center rounded-full bg-gold px-1 text-[9px] font-bold text-black">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
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
