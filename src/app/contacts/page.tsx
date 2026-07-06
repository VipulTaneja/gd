import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { PageHeader } from "@/components/shared/page-header";
import { ContactsList } from "@/components/contacts/contacts-list";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user.globalRole);

  const contacts = await db.importantContact.findMany({
    include: { lastEditedBy: { select: { name: true } } },
    orderBy: [{ category: "asc" }, { typeOfService: "asc" }],
  });

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <PageHeader
          feature="directory"
          title="Important Contacts"
          subtitle="Society services, maintenance, and vendor contacts"
        />
        <ContactsList
          contacts={contacts.map((c) => ({
            ...c,
            lastEditedAt: c.lastEditedAt.toISOString(),
          }))}
          currentUserId={session.user.id}
          isAdmin={isAdmin}
        />
      </div>
    </DashboardLayout>
  );
}
