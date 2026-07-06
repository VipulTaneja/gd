import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare } from "lucide-react";
import { empty } from "@/lib/microcopy";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forums — Gulshan Dynasty",
  description: "Join neighborhood discussions, share suggestions, and connect with your community.",
};

function timeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default async function ForumsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const forums = await db.forum.findMany({
    where: { isArchived: false },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { threads: true } },
      threads: {
        orderBy: { lastActivityAt: "desc" },
        take: 1,
        select: { lastActivityAt: true },
      },
    },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="forums"
          title="Forums"
          subtitle="Discuss with your community"
        />

        <div className="space-y-3">
          {forums.map((forum) => (
            <Link key={forum.id} href={`/forums/${forum.slug}`}>
              <SoftCard className="transition-all hover:shadow-md hover:ring-cyan-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-base font-semibold">{forum.name}</h3>
                    {forum.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {forum.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{forum._count.threads} threads</span>
                      {forum.threads[0]?.lastActivityAt && (
                        <span>Last activity {timeAgo(forum.threads[0].lastActivityAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </SoftCard>
            </Link>
          ))}
          {forums.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title={empty.forums.title}
              description={empty.forums.description}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
