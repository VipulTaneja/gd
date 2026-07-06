"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, X, Save, Loader2 } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

interface UserProfileEditProps {
  user: UserData;
  onUpdate: (data: {
    name?: string;
    phone?: string;
    organization?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  }) => Promise<void>;
}

export function UserProfileEdit({ user, onUpdate }: UserProfileEditProps) {
  const [editing, setEditing] = useState(false);
  const [saving, startSaving] = useTransition();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone ?? "",
    organization: user.organization ?? "",
    emergencyContactName: user.emergencyContactName ?? "",
    emergencyContactPhone: user.emergencyContactPhone ?? "",
  });

  const handleSubmit = async () => {
    startSaving(async () => {
      await onUpdate(formData);
      setEditing(false);
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditing(true)}
        className="gap-1"
      >
        <Pencil className="h-3 w-3" /> Edit Profile
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Profile</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Emergency Contact Name</Label>
            <Input
              id="emergencyName"
              value={formData.emergencyContactName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContactName: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContactPhone: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
