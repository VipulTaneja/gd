"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications/unread")
      .then((r) => r.json())
      .then((data) => setUnreadCount(data.count))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <Link
        href="/notifications"
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-black">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
