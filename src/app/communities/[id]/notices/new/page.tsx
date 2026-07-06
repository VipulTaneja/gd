import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { NoticeForm } from "@/components/notices/notice-form";
import { isCommunityLeader } from "@/lib/rbac-leaders";
import { isAdmin } from "@/lib/rbac";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CommunityNoticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const community = await db.subCommunity.findUnique({
    where: { id, isArchived: false },
    select: { id: true, name: true },
  });
  if (!community) notFound();

  const userId = session.user.id;
  const [user, canPost] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, globalRole: true },
    }),
    (async () => (await isAdmin(userId)) || (await isCommunityLeader(userId, id)))(),
  ]);

  if (!user) redirect("/login");
  if (!canPost) redirect(`/communities/${id}`);

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link href={`/communities/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← {community.name}
        </Link>
        <h1 className="font-heading text-2xl font-bold">Post community update</h1>
        <p className="text-sm text-muted-foreground">
          This notice will be visible to {community.name} members only.
        </p>
        <div className="rounded-xl border bg-card p-6">
          <NoticeForm communityId={community.id} />
        </div>
      </div>
    </DashboardLayout>
  );
}
