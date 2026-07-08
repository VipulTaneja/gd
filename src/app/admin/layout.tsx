import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = session?.user?.globalRole;

  if (!session?.user?.id || !isAdminRole(userRole)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 border-r bg-primary lg:block">
        <div className="flex h-16 items-center px-6">
          <Link href="/admin" className="font-heading text-lg font-bold text-primary-foreground">
            GD Admin
          </Link>
        </div>
        <AdminSidebarNav />
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="flex h-16 items-center border-b px-4 sm:px-6">
          <div className="lg:hidden mr-4">
            <AdminMobileNav />
          </div>
          <h1 className="font-heading text-xl font-semibold">Admin Panel</h1>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
