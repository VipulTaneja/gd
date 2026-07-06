import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { UserLink } from "@/components/shared/user-link";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ReplyComposer } from "@/components/forums/reply-composer";

export const dynamic = "force-dynamic";

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ slug: string; threadId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true, id: true },
  });
  if (!user) redirect("/login");

  const { slug, threadId } = await params;

  const thread = await db.forumThread.findUnique({
    where: { id: threadId },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      forum: true,
      posts: {
        where: { isHidden: false },
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!thread || thread.forum.slug !== slug) redirect("/forums");

  await db.forumThread.update({
    where: { id: threadId },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 pb-24 md:pb-6">
        <Breadcrumb
          items={[
            { label: "Forums", href: "/forums" },
            { label: thread.forum.name, href: `/forums/${slug}` },
            { label: thread.title },
          ]}
        />

        <PageHeader
          feature="forums"
          title={thread.title}
          subtitle={`by ${thread.author.name} · ${thread.viewCount + 1} views`}
        />

        <SoftCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserLink
                userId={thread.author.id}
                name={thread.author.name}
                avatarUrl={thread.author.avatarUrl}
                showAvatar
              />
              <span className="text-xs text-muted-foreground">
                {thread.createdAt.toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{thread.body}</p>
          </div>
        </SoftCard>

        <div className="space-y-3">
          {thread.posts.slice(1).map((post) => (
            <SoftCard key={post.id}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <UserLink
                    userId={post.author.id}
                    name={post.author.name}
                    avatarUrl={post.author.avatarUrl}
                    showAvatar
                  />
                  <span className="text-xs text-muted-foreground">
                    {post.createdAt.toLocaleDateString()}
                  </span>
                  {post.editedAt && (
                    <span className="text-xs text-muted-foreground italic">(edited)</span>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{post.body}</p>
              </div>
            </SoftCard>
          ))}
        </div>

        {thread.status !== "LOCKED" && (
          <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card p-4 md:static md:border-0 md:p-0">
            <ReplyComposer threadId={thread.id} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
