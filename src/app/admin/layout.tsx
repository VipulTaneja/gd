import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, LayoutDashboard, Home, FileText, Settings } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/units", label: "Units", icon: Home },
  { href: "/admin/notices", label: "Notices", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userRole = (session?.user as any)?.globalRole;

  if (!session?.user?.id || !["SUPER_ADMIN", "ADMIN"].includes(userRole)) {
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
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="flex h-16 items-center border-b px-4 sm:px-6">
          <div className="lg:hidden mr-4">
            <AdminMobileNav navItems={navItems} />
          </div>
          <h1 className="font-heading text-xl font-semibold">Admin Panel</h1>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
