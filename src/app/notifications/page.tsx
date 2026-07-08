import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationList } from "./notification-list";
import { empty } from "@/lib/microcopy";
import { getUnreadCount } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = await getUnreadCount(session.user.id);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="notifications"
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        />

        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title={empty.notifications.title} description={empty.notifications.description} />
        ) : (
          <NotificationList
            notifications={notifications.map((n) => ({
              ...n,
              createdAt: n.createdAt.toISOString(),
            }))}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
