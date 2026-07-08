import { adminStatusColor } from "@/lib/admin-status-colors";

export function AdminStatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${adminStatusColor(value)}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
