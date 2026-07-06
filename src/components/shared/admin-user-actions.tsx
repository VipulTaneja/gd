"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  UserX,
  UserCheck,
  Loader2,
} from "lucide-react";

interface AdminUserActionsProps {
  globalRole: string;
  approvalStatus: string;
  isActive: boolean;
  onRoleChange: (role: string) => Promise<void>;
  onDeactivate: () => Promise<void>;
  onReactivate: () => Promise<void>;
}

export function AdminUserActions({
  globalRole,
  approvalStatus,
  isActive,
  onRoleChange,
  onDeactivate,
  onReactivate,
}: AdminUserActionsProps) {
  const [loading, startLoading] = useTransition();
  const router = useRouter();

  const handleRoleChange = async (role: string) => {
    startLoading(async () => {
      await onRoleChange(role);
      router.refresh();
    });
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    startLoading(async () => {
      await onDeactivate();
      router.refresh();
    });
  };

  const handleReactivate = async () => {
    startLoading(async () => {
      await onReactivate();
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-gold" />
          Admin Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Global Role</label>
              <Select
                value={globalRole}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="RESIDENT">Resident</SelectItem>
                  <SelectItem value="NON_RESIDENT">Non-Resident</SelectItem>
                  <SelectItem value="SECURITY_STAFF">Security Staff</SelectItem>
                </SelectContent>
              </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <div className="flex items-center gap-2">
            <Badge
              variant={isActive ? "default" : "destructive"}
              className={isActive ? "bg-green-100 text-green-800" : ""}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{approvalStatus}</Badge>
          </div>
        </div>

        <div className="flex gap-2">
          {isActive ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeactivate}
              disabled={loading}
              className="gap-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserX className="h-4 w-4" />
              )}
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivate}
              disabled={loading}
              className="gap-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
              Reactivate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
