import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listManageHubHeroSlides } from "@/lib/hub-hero";
import { canManageCommunityContent } from "@/lib/faq-auth";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { HubHeroManagePanel } from "@/components/hub/hub-hero-manage-panel";
import { Button } from "@/components/ui/button";
import { hubHero } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function HubHeroManagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/hub/hero/manage");

  const canEdit = await canManageCommunityContent(session.user.id);
  if (!canEdit) redirect("/");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const slides = await listManageHubHeroSlides();

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="home"
          title={hubHero.manageTitle}
          subtitle={hubHero.manageSubtitle}
          action={
            <Button
              variant="outline"
              render={<Link href="/" />}
              nativeButton={false}
              className="min-h-11 w-full sm:w-auto"
            >
              {hubHero.viewHub}
            </Button>
          }
        />
        <HubHeroManagePanel initialSlides={slides} />
      </div>
    </DashboardLayout>
  );
}
