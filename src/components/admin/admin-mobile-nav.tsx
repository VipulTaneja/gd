"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Users,
  Home,
  FileText,
  HelpCircle,
  Settings,
  Crown,
  Sparkles,
  CreditCard,
  Building2,
  MessageSquare,
  Truck,
  LifeBuoy,
  Car,
  Download,
  History,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { adminNavItems, type AdminNavIcon } from "@/lib/admin-nav";

const adminNavIcons: Record<AdminNavIcon, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  home: Home,
  "file-text": FileText,
  "help-circle": HelpCircle,
  settings: Settings,
  crown: Crown,
  sparkles: Sparkles,
  "credit-card": CreditCard,
  building: Building2,
  "message-square": MessageSquare,
  truck: Truck,
  "life-buoy": LifeBuoy,
  car: Car,
  download: Download,
  history: History,
};

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Open navigation" />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-r bg-primary p-0 text-primary-foreground">
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-primary-foreground">GD Admin</SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 px-3 py-4">
          {adminNavItems.map((item) => {
            const Icon = adminNavIcons[item.icon];
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <SheetTrigger
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-foreground/15 text-primary-foreground"
                        : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    )}
                  />
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </SheetTrigger>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
