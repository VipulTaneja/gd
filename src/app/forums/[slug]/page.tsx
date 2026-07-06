import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { EmptyState } from "@/components/shared/empty-state";
import { UserLink } from "@/components/shared/user-link";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { MessageSquare } from "lucide-react";
import { empty } from "@/lib/microcopy";
import Link from "next/link";
import { canReadForum } from "@/lib/forums/rbac";

export const dynamic = "force-dynamic";

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

export default async function ForumThreadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true, id: true, approvalStatus: true },
  });
  if (!user) redirect("/login");

  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const forum = await db.forum.findUnique({ where: { slug } });
  if (!forum) redirect("/forums");

  if (!canReadForum(forum, user as { id: string; globalRole: string; approvalStatus: string })) {
    redirect("/forums");
  }

  const [threads, total] = await Promise.all([
    db.forumThread.findMany({
      where: { forumId: forum.id, status: { not: "HIDDEN" } },
      orderBy: [{ isPinned: "desc" }, { lastActivityAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { posts: true } },
      },
    }),
    db.forumThread.count({
      where: { forumId: forum.id, status: { not: "HIDDEN" } },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Forums", href: "/forums" }, { label: forum.name }]} />

        <PageHeader
          feature="forums"
          title={forum.name}
          subtitle={forum.description || undefined}
          action={
            <Link
              href={`/forums/${slug}/new`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
            >
              New Thread
            </Link>
          }
        />

        <div className="space-y-3">
          {threads.map((thread) => (
            <Link key={thread.id} href={`/forums/${slug}/${thread.id}`}>
              <SoftCard className="transition-all hover:shadow-md hover:ring-cyan-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {thread.isPinned && (
                        <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">
                          Pinned
                        </span>
                      )}
                      {thread.status === "LOCKED" && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Locked
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 font-heading text-base font-semibold">{thread.title}</h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <UserLink
                        userId={thread.author.id}
                        name={thread.author.name}
                        avatarUrl={thread.author.avatarUrl}
                      />
                      <span>{thread._count.posts} replies</span>
                      <span>{thread.viewCount} views</span>
                      <span>{timeAgo(thread.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>
              </SoftCard>
            </Link>
          ))}
          {threads.length === 0 && (
            <EmptyState
              icon={MessageSquare}
              title={empty.forumThreads.title}
              description={empty.forumThreads.description}
              action={{ label: "New Thread", href: `/forums/${slug}/new` }}
            />
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/forums/${slug}?page=${page - 1}`}
                className="inline-flex h-9 items-center justify-center rounded-full bg-card px-4 text-sm font-medium ring-1 ring-foreground/5 hover:bg-muted transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/forums/${slug}?page=${page + 1}`}
                className="inline-flex h-9 items-center justify-center rounded-full bg-card px-4 text-sm font-medium ring-1 ring-foreground/5 hover:bg-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
