"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, X, Check } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { InlineAlert } from "@/components/shared/inline-alert";
import { approveUser, rejectUser, deactivateUser, changeUserRole, approveClaim, rejectClaim } from "./server-actions";

export function ApproveUserButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => approveUser(userId))}
      className="inline-flex h-8 items-center justify-center rounded-lg bg-green-600 px-3 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? "..." : "Approve"}
    </button>
  );
}

export function RejectUserButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => rejectUser(userId))}
      className="inline-flex h-8 items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? "..." : "Reject"}
    </button>
  );
}

export function DeactivateUserButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const deactivate = () => {
    startTransition(async () => {
      await deactivateUser(userId);
      setOpen(false);
    });
  };

  return (
    <>
      <button
        disabled={pending}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "..." : "Deactivate"}
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Deactivate this user?"
        description="They will no longer be able to sign in."
        confirmLabel="Deactivate"
        onConfirm={deactivate}
        pending={pending}
      />
    </>
  );
}

export function ChangeRoleSelect({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [pending, startTransition] = useTransition();
  const roles = ["SUPER_ADMIN", "ADMIN", "RESIDENT", "NON_RESIDENT", "SECURITY_STAFF"];

  return (
    <select
      value={currentRole}
      disabled={pending}
      onChange={(e) => startTransition(() => changeUserRole(userId, e.target.value))}
      className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}

export function ApproveClaimButton({ userId, unitId }: { userId: string; unitId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => approveClaim(userId, unitId))}
      className="inline-flex h-8 items-center justify-center rounded-lg bg-green-600 px-3 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
    >
      {pending ? "..." : "Approve"}
    </button>
  );
}

export function RejectClaimButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => rejectClaim(userId))}
      className="inline-flex h-8 items-center justify-center rounded-lg bg-red-600 px-3 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? "..." : "Reject"}
    </button>
  );
}

export function EditUserButton({
  userId,
  currentName,
  currentPhone,
  currentEmergencyName,
  currentEmergencyPhone,
}: {
  userId: string;
  currentName: string;
  currentPhone: string;
  currentEmergencyName: string;
  currentEmergencyPhone: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(currentName);
  const [phone, setPhone] = useState(currentPhone);
  const [emergencyName, setEmergencyName] = useState(currentEmergencyName);
  const [emergencyPhone, setEmergencyPhone] = useState(currentEmergencyPhone);

  const handleSave = () => {
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          phone: phone || null,
          emergencyContactName: emergencyName || null,
          emergencyContactPhone: emergencyPhone || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to save user");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center justify-center rounded-lg bg-muted px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/80"
        title="Edit user"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold">Edit User Details</h3>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && <InlineAlert className="mb-4">{error}</InlineAlert>}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Emergency Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="mt-1 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="mt-1 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold md:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
