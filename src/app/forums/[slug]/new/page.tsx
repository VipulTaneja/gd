import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { NewThreadForm } from "./form";
import { canPost } from "@/lib/forums/rbac";

export const dynamic = "force-dynamic";

export default async function NewThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true, id: true, approvalStatus: true },
  });
  if (!user) redirect("/login");

  const { slug } = await params;

  const forum = await db.forum.findUnique({ where: { slug } });
  if (!forum) redirect("/forums");

  if (!(await canPost(forum, user as { id: string; globalRole: string; approvalStatus: string }))) {
    redirect(`/forums/${slug}`);
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: "Forums", href: "/forums" },
            { label: forum.name, href: `/forums/${slug}` },
            { label: "New Thread" },
          ]}
        />

        <PageHeader
          feature="forums"
          title="New Thread"
          subtitle={`in ${forum.name}`}
        />

        <NewThreadForm slug={slug} />
      </div>
    </DashboardLayout>
  );
}
