import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { ContactsList } from "@/components/contacts/contacts-list";
import { getContactReviewAggregates } from "@/lib/contact-reviews";
import { contacts as contactsCopy } from "@/lib/microcopy";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const isAdmin = isAdminRole(user.globalRole);

  const contacts = await db.importantContact.findMany({
    include: { lastEditedBy: { select: { name: true } } },
    orderBy: [{ category: "asc" }, { typeOfService: "asc" }],
  });

  const aggregates = await getContactReviewAggregates(contacts.map((c) => c.id));

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="contacts"
          title={contactsCopy.title}
          subtitle={contactsCopy.subtitle}
        />
        <ContactsList
          contacts={contacts.map((c) => ({
            ...c,
            lastEditedAt: c.lastEditedAt.toISOString(),
            avgRating: aggregates.get(c.id)?.avgRating ?? null,
            reviewCount: aggregates.get(c.id)?.reviewCount ?? 0,
          }))}
          currentUserId={session.user.id}
          isAdmin={isAdmin}
        />
      </div>
    </DashboardLayout>
  );
}
