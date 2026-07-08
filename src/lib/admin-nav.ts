export type AdminNavIcon =
  | "layout-dashboard"
  | "users"
  | "home"
  | "file-text"
  | "help-circle"
  | "settings"
  | "crown"
  | "sparkles"
  | "credit-card"
  | "building"
  | "message-square"
  | "truck"
  | "life-buoy"
  | "car"
  | "download"
  | "history";

export const adminNavItems: {
  href: string;
  label: string;
  icon: AdminNavIcon;
}[] = [
  { href: "/admin", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/units", label: "Units", icon: "home" },
  { href: "/admin/staff", label: "Staff", icon: "users" },
  { href: "/admin/committee", label: "Committee", icon: "crown" },
  { href: "/admin/communities", label: "Communities", icon: "sparkles" },
  { href: "/admin/dues", label: "Dues", icon: "credit-card" },
  { href: "/admin/facilities", label: "Facilities", icon: "building" },
  { href: "/admin/forums", label: "Forums", icon: "message-square" },
  { href: "/admin/moves", label: "Moves", icon: "truck" },
  { href: "/admin/notices", label: "Notices", icon: "file-text" },
  { href: "/admin/tickets", label: "Tickets", icon: "life-buoy" },
  { href: "/admin/vehicles", label: "Vehicles", icon: "car" },
  { href: "/faq/manage", label: "FAQ", icon: "help-circle" },
  { href: "/admin/export", label: "Export", icon: "download" },
  { href: "/admin/audit", label: "Audit log", icon: "history" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];
