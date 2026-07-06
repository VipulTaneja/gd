"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditMembershipButtonProps {
  membershipId: string;
  unitId: string;
  currentRole: string;
  currentIsPrimary: boolean;
  currentEndDate: string | null;
}

const ROLES = [
  { value: "OWNER", label: "Owner" },
  { value: "JOINT_OWNER", label: "Joint Owner" },
  { value: "TENANT", label: "Tenant" },
  { value: "OWNER_FAMILY", label: "Owner Family" },
  { value: "TENANT_FAMILY", label: "Tenant Family" },
];

export function EditMembershipButton({
  membershipId,
  unitId,
  currentRole,
  currentIsPrimary,
  currentEndDate,
}: EditMembershipButtonProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState(currentRole);
  const [isPrimary, setIsPrimary] = useState(currentIsPrimary);
  const [endDate, setEndDate] = useState(currentEndDate ? currentEndDate.split("T")[0] : "");

  const handleSave = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/memberships", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipId,
          unitId,
          role,
          isPrimary,
          endDate: endDate || null,
        }),
      });

      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    });
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-8 rounded-md border bg-transparent px-2 text-xs"
          placeholder="End date (optional)"
        />
        <button
          onClick={() => setIsPrimary(!isPrimary)}
          className={`h-8 px-2 rounded-md text-xs font-medium transition-colors ${
            isPrimary ? "bg-blue-100 text-blue-800" : "bg-muted text-muted-foreground"
          }`}
        >
          Primary
        </button>
        <button
          onClick={handleSave}
          disabled={pending}
          className="h-8 w-8 rounded-md bg-gold/10 text-gold flex items-center justify-center hover:bg-gold/20 transition-colors"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setEditing(false)}
          className="h-8 w-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="h-8 w-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center hover:bg-muted/80 transition-colors"
      title="Edit membership"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
  );
}
