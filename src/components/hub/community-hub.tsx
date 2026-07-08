"use client";

import { ReactNode } from "react";
import { MobileBottomNav } from "@/components/shell/mobile-bottom-nav";

interface CommunityHubProps {
  isAuthenticated?: boolean;
  isLeader?: boolean;
  header: ReactNode;
  hero: ReactNode;
  shortcuts: ReactNode;
  feed: ReactNode;
  pulse: ReactNode;
  amenityChips: ReactNode;
  footer: ReactNode;
}

export function CommunityHub({
  isAuthenticated,
  isLeader,
  header,
  hero,
  shortcuts,
  feed,
  pulse,
  amenityChips,
  footer,
}: CommunityHubProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {header}

      <main className="flex-1 flex flex-col pb-20 md:pb-0">
        {hero}

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              {shortcuts}
              {amenityChips}
            </div>

            <div className="lg:col-span-8 space-y-6">
              {feed}
              {pulse}
            </div>
          </div>
        </div>
      </main>

      {footer}
      <MobileBottomNav isAuthenticated={isAuthenticated} isLeader={isLeader} />
    </div>
  );
}
