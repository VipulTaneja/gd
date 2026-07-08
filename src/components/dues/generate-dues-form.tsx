"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export function GenerateDuesForm() {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; count?: number } | null>(null);
  const [errors, setErrors] = useState<{ label?: string; amount?: string; dueDate?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!label.trim()) newErrors.label = "Label is required";
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBulk = () => {
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const confirmBulk = () => {
    startTransition(async () => {
      const res = await fetch("/api/dues/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, amount: parseFloat(amount), dueDate, bulk: true }),
      });
      const data = await res.json();
      setResult(data);
      setConfirmOpen(false);
    });
  };

  return (
    <div className="space-y-4">
      {result?.error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{result.error}</div>}
      {result?.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
          Generated {result.count} due records
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="dues-label" className="text-sm font-medium">Label</label>
          <input id="dues-label" type="text" value={label} onChange={(e) => { setLabel(e.target.value); setErrors((p) => ({ ...p, label: undefined })); }}
            placeholder="e.g. Maintenance Q1 2026"
            aria-invalid={!!errors.label}
            aria-describedby={errors.label ? "dues-label-error" : undefined}
            className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.label ? "border-red-500" : "border-input"}`} />
          {errors.label && <p id="dues-label-error" className="text-xs text-red-600">{errors.label}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dues-amount" className="text-sm font-medium">Amount (₹)</label>
          <input id="dues-amount" type="number" min={1} value={amount} onChange={(e) => { setAmount(e.target.value); setErrors((p) => ({ ...p, amount: undefined })); }}
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "dues-amount-error" : undefined}
            className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.amount ? "border-red-500" : "border-input"}`} />
          {errors.amount && <p id="dues-amount-error" className="text-xs text-red-600">{errors.amount}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="dues-date" className="text-sm font-medium">Due Date</label>
          <input id="dues-date" type="date" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: undefined })); }}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? "dues-date-error" : undefined}
            className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.dueDate ? "border-red-500" : "border-input"}`} />
          {errors.dueDate && <p id="dues-date-error" className="text-xs text-red-600">{errors.dueDate}</p>}
        </div>
      </div>

      <button onClick={handleBulk} disabled={pending}
        className="inline-flex h-9 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black transition-colors hover:bg-gold-light disabled:opacity-50">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
        ) : (
          "Generate for All Units"
        )}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Generate dues for all units?"
        description={`This will create a ₹${amount} due for every unit.`}
        confirmLabel="Generate"
        onConfirm={confirmBulk}
        pending={pending}
        destructive={false}
      />
    </div>
  );
}
