"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RejectBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  pending?: boolean;
}

export function RejectBookingDialog({
  open,
  onOpenChange,
  onConfirm,
  pending = false,
}: RejectBookingDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    setReason("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setReason("");
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject booking</DialogTitle>
          <DialogDescription>
            Provide a reason so the resident knows why the request was declined.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          <Label htmlFor="reject-reason">Reason</Label>
          <textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Required"
            rows={3}
            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base md:text-sm"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={pending || !reason.trim()}
            onClick={handleConfirm}
          >
            Reject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
