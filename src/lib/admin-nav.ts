export type AdminNavIcon =
  | "layout-dashboard"
  | "users"
  | "home"
  | "file-text"
  | "help-circle"
  | "settings";

export const adminNavItems: {
  href: string;
  label: string;
  icon: AdminNavIcon;
}[] = [
  { href: "/admin", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/units", label: "Units", icon: "home" },
  { href: "/admin/staff", label: "Staff", icon: "users" },
  { href: "/admin/notices", label: "Notices", icon: "file-text" },
  { href: "/faq/manage", label: "FAQ", icon: "help-circle" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];
