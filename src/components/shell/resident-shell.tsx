"use client";

import { ReactNode } from "react";
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
}

export function ResidentShell({ children, user, unreadCount = 0 }: ResidentShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CasualHeader
        user={user}
        unreadCount={unreadCount}
      />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] md:pb-8">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
