import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/rbac";
import { staffRoleLabel } from "@/lib/staff";
import { AdminStaffReviewActions } from "@/components/admin/admin-staff-review-actions";

export const dynamic = "force-dynamic";

export default async function AdminStaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await isAdmin(session.user.id))) redirect("/");

  const { id } = await params;

  const person = await db.staffPerson.findUnique({
    where: { id },
    include: {
      associations: {
        include: { unit: true, registeredBy: { select: { name: true } } },
        orderBy: { startDate: "desc" },
      },
      reviews: {
        include: { author: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      visitorPasses: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { unit: { select: { unitNumber: true } } },
      },
    },
  });

  if (!person) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">{person.name}</h1>
        <p className="text-sm text-muted-foreground">Phone: {person.phone}</p>
      </div>

      <section className="rounded-xl border p-4 space-y-2">
        <h2 className="font-semibold">Associations</h2>
        {person.associations.map((a) => (
          <div key={a.id} className="text-sm border-b pb-2">
            {a.unit?.unitNumber ?? "Society"} · {staffRoleLabel(a.role)} · {a.status}
            {a.needsReview && <span className="ml-2 text-amber-600">Needs review</span>}
          </div>
        ))}
      </section>

      <section className="rounded-xl border p-4 space-y-3">
        <h2 className="font-semibold">Reviews</h2>
        {person.reviews.map((r) => (
          <div key={r.id} className="text-sm border-b pb-2 flex justify-between gap-2">
            <div>
              <span className="font-medium">{r.author.name}</span> · {"★".repeat(r.rating)}
              {r.isHidden && <span className="ml-2 text-muted-foreground">(hidden)</span>}
              {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
            </div>
            <AdminStaffReviewActions reviewId={r.id} isHidden={r.isHidden} />
          </div>
        ))}
      </section>

      <section className="rounded-xl border p-4 space-y-2">
        <h2 className="font-semibold">Recent passes</h2>
        {person.visitorPasses.map((p) => (
          <div key={p.id} className="text-sm">
            {p.visitorName} · {p.unit?.unitNumber ?? "Multi-unit"} · {p.status}
          </div>
        ))}
      </section>
    </div>
  );
}
