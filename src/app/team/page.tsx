import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { TeamContent } from "@/components/team/team-content";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="team"
          title="Meet Our Team"
          subtitle="Gulshan Dynasty Welfare Association"
        />
        <TeamContent />
      </div>
    </DashboardLayout>
  );
}
