"use client";

import { useState, useTransition } from "react";
import { inviteMemberViaRequest } from "./invite-actions";

const ROLES = ["OWNER", "JOINT_OWNER", "TENANT", "OWNER_FAMILY", "TENANT_FAMILY"];

export function InviteMemberForm({ unitId }: { unitId: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("TENANT");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await inviteMemberViaRequest(unitId, { email, role });
      setResult(res);
      if (res.success) {
        setEmail("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Sends an auditable invite the resident accepts on their profile (instead of direct assignment).
      </p>

      {result?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>
      )}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Invite sent successfully</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">User Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@example.com"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
      >
        {pending ? "Sending invite..." : "Send invite"}
      </button>
    </form>
  );
}
