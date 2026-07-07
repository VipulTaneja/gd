import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listManageHubHeroSlides } from "@/lib/hub-hero";
import { canManageHubHero } from "@/lib/hub-hero-auth";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { HubHeroManagePanel } from "@/components/hub/hub-hero-manage-panel";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function HubHeroManagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/hub/hero/manage");

  const canEdit = await canManageHubHero(session.user.id);
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
          title="Hub hero carousel"
          subtitle="Add, reorder, or remove images on the community home page. Each slide can link anywhere when clicked."
          action={
            <Button
              variant="outline"
              render={<Link href="/" />}
              className="min-h-11 w-full sm:w-auto"
            >
              View hub
            </Button>
          }
        />
        <HubHeroManagePanel initialSlides={slides} />
      </div>
    </DashboardLayout>
  );
}
