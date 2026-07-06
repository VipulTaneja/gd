"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  CreditCard,
  Loader2,
} from "lucide-react";

interface AdminUnitActionsProps {
  onAssignResident: (data: { userId: string; role: string }) => Promise<void>;
  onGenerateDue: (data: { label: string; amount: number; dueDate: string }) => Promise<void>;
}

export function AdminUnitActions({
  onAssignResident,
  onGenerateDue,
}: AdminUnitActionsProps) {
  const [showAssign, setShowAssign] = useState(false);
  const [showDue, setShowDue] = useState(false);
  const [loading, startLoading] = useTransition();
  const router = useRouter();

  const [assignData, setAssignData] = useState({ userId: "", role: "OWNER" });
  const [dueData, setDueData] = useState({
    label: "",
    amount: 0,
    dueDate: "",
  });

  const handleAssign = async () => {
    if (!assignData.userId) return;
    startLoading(async () => {
      await onAssignResident(assignData);
      setShowAssign(false);
      router.refresh();
    });
  };

  const handleDue = async () => {
    if (!dueData.label || !dueData.amount || !dueData.dueDate) return;
    startLoading(async () => {
      await onGenerateDue(dueData);
      setShowDue(false);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Admin Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => {
            setShowAssign(!showAssign);
            setShowDue(false);
          }}
        >
          <UserPlus className="h-4 w-4" /> Assign Resident
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => {
            setShowDue(!showDue);
            setShowAssign(false);
          }}
        >
          <CreditCard className="h-4 w-4" /> Generate Due
        </Button>

        {showAssign && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-2">
              <Label htmlFor="assignUserId">User ID / Email</Label>
              <Input
                id="assignUserId"
                value={assignData.userId}
                onChange={(e) =>
                  setAssignData({ ...assignData, userId: e.target.value })
                }
                placeholder="Enter user ID or email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={assignData.role}
                onValueChange={(v: string) => setAssignData({ ...assignData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="JOINT_OWNER">Joint Owner</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                  <SelectItem value="OWNER_FAMILY">Owner Family</SelectItem>
                  <SelectItem value="TENANT_FAMILY">Tenant Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={handleAssign} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Assign
            </Button>
          </div>
        )}

        {showDue && (
          <div className="space-y-3 border-t pt-3">
            <div className="space-y-2">
              <Label htmlFor="dueLabel">Label</Label>
              <Input
                id="dueLabel"
                value={dueData.label}
                onChange={(e) =>
                  setDueData({ ...dueData, label: e.target.value })
                }
                placeholder="e.g. Maintenance Q1 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueAmount">Amount (₹)</Label>
              <Input
                id="dueAmount"
                type="number"
                value={dueData.amount || ""}
                onChange={(e) =>
                  setDueData({ ...dueData, amount: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueData.dueDate}
                onChange={(e) =>
                  setDueData({ ...dueData, dueDate: e.target.value })
                }
              />
            </div>
            <Button size="sm" onClick={handleDue} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Generate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
