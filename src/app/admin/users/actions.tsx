"use client";

import { useTransition } from "react";
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
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm("Are you sure you want to deactivate this user?")) {
          startTransition(() => deactivateUser(userId));
        }
      }}
      className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "..." : "Deactivate"}
    </button>
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
