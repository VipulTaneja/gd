/** Shared status/priority pill colors for the admin panel — kept separate from
 * FriendlyBadge, which uses resident-facing casual copy inappropriate for admin. */
export const ADMIN_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  DISMISSED: "bg-gray-100 text-gray-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  EMERGENCY: "bg-red-100 text-red-800",
  IMPORTANT: "bg-amber-100 text-amber-800",
  NORMAL: "bg-gray-100 text-gray-800",
  ACTIVE: "bg-green-100 text-green-800",
  ENDED: "bg-gray-100 text-gray-800",
  USED: "bg-blue-100 text-blue-800",
  EXPIRED: "bg-gray-100 text-gray-800",
};

export function adminStatusColor(value: string): string {
  return ADMIN_STATUS_COLORS[value] ?? "bg-gray-100 text-gray-800";
}
