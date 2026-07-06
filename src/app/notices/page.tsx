import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { SoftCard } from "@/components/shared/soft-card";
import { FriendlyBadge } from "@/components/shared/friendly-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell } from "lucide-react";
import { nav, actions, empty } from "@/lib/microcopy";
import Link from "next/link";

export const dynamic = "force-dynamic";

const priorityAccent: Record<string, "amber" | "rose" | "none"> = {
  EMERGENCY: "rose",
  IMPORTANT: "amber",
  NORMAL: "none",
};

export default async function NoticesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  // Get user's tower for filtering
  const membership = await db.unitMembership.findFirst({
    where: { userId: session.user!.id, OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    include: { unit: { select: { block: true } } },
  });

  const userTower = membership?.unit.block;

  const notices = await db.notice.findMany({
    where: {
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        { OR: [{ targetBlock: null }, { targetBlock: userTower }] },
      ],
    },
    orderBy: [{ priority: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="notices"
          title={nav.notices}
          subtitle="Updates from your RWA and community"
          action={
            ["SUPER_ADMIN", "ADMIN"].includes(user.globalRole) ? (
              <Link
                href="/admin/notices/new"
                className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-4 text-sm font-semibold text-black transition-colors hover:bg-gold-light"
              >
                Post update
              </Link>
            ) : undefined
          }
        />

        <div className="space-y-3">
          {notices.map((notice) => (
            <SoftCard
              key={notice.id}
              accent={priorityAccent[notice.priority] ?? "none"}
            >
              <div className="flex items-start gap-3">
                <FriendlyBadge value={notice.priority} variant="priority" />
                <div className="flex-1">
                  <h3 className="font-heading text-base font-semibold">{notice.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{notice.body}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{notice.publishedAt.toLocaleDateString()}</span>
                    {notice.targetBlock && <span>Tower {notice.targetBlock}</span>}
                    {notice.expiresAt && <span>Expires {notice.expiresAt.toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            </SoftCard>
          ))}
          {notices.length === 0 && (
            <EmptyState
              icon={Bell}
              title={empty.notices.title}
              description={empty.notices.description}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
