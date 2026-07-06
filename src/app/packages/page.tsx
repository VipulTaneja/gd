import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Package, Check } from "lucide-react";

export const dynamic = "force-dynamic";

async function getPackages(userId: string) {
  return db.visitorPass.findMany({
    where: {
      userId,
      visitorType: "DELIVERY",
      status: { in: ["ACTIVE", "USED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export default async function PackagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, globalRole: true },
  });
  if (!user) redirect("/login");

  const packages = await getPackages(session.user.id);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Package Inbox</h1>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">No packages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  pkg.status === "USED" ? "bg-green-100" : "bg-amber-100"
                }`}>
                  {pkg.status === "USED" ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Package className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{pkg.visitorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {pkg.createdAt.toLocaleDateString()} · {pkg.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  pkg.status === "USED" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {pkg.status === "USED" ? "Collected" : "Awaiting Pickup"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
