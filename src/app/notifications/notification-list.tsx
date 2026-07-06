"use client";

import { useTransition, useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(notifications);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

  const hasUnread = items.some((n) => !n.isRead);

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            disabled={pending}
            onClick={handleMarkAllRead}
            className="text-sm text-gold hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-4 rounded-xl border p-4 ${
              !n.isRead ? "bg-gold/5 border-gold/20" : ""
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {!n.isRead && <span className="h-2 w-2 rounded-full bg-gold" />}
                <p className={`text-sm ${!n.isRead ? "font-medium" : ""}`}>{n.title}</p>
              </div>
              {n.body && (
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {n.link && (
                <Link href={n.link} className="text-xs text-gold hover:underline">
                  View
                </Link>
              )}
              {!n.isRead && (
                <button
                  disabled={pending}
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
