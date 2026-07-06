export type AdminNavIcon =
  | "layout-dashboard"
  | "users"
  | "home"
  | "file-text"
  | "settings";

export const adminNavItems: {
  href: string;
  label: string;
  icon: AdminNavIcon;
}[] = [
  { href: "/admin", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/users", label: "Users", icon: "users" },
  { href: "/admin/units", label: "Units", icon: "home" },
  { href: "/admin/notices", label: "Notices", icon: "file-text" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];
