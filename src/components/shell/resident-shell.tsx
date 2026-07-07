"use client";

import { ReactNode, Suspense } from "react";
import { CasualHeader } from "@/components/shell/casual-header";
import { MobileBottomNav } from "@/components/shell/mobile-bottom-nav";

interface ResidentShellProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    id?: string;
    avatarUrl?: string | null;
    globalRole?: string;
  };
  unreadCount?: number;
  isLeader?: boolean;
}

export function ResidentShell({
  children,
  user,
  unreadCount = 0,
  isLeader = false,
}: ResidentShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Suspense fallback={<header className="sticky top-0 z-50 h-14 border-b border-border/60 bg-background/80" />}>
        <CasualHeader
          user={user}
          unreadCount={unreadCount}
        />
      </Suspense>
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] md:pb-8">
        {children}
      </main>
      <MobileBottomNav isLeader={isLeader} />
    </div>
  );
}
