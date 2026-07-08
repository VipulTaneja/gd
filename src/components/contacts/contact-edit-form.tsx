"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { contacts as contactsCopy } from "@/lib/microcopy";
import { useJsonMutation } from "@/lib/client-api";

interface ContactEditFormProps {
  contactId: string;
  initialName: string | null;
  initialContactNo: string;
  initialRemarks: string | null;
  canEdit: boolean;
}

export function ContactEditForm({
  contactId,
  initialName,
  initialContactNo,
  initialRemarks,
  canEdit,
}: ContactEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName ?? "");
  const [contactNo, setContactNo] = useState(initialContactNo);
  const [remarks, setRemarks] = useState(initialRemarks ?? "");
  const { pending, error, setError, refresh, apiCall, startTransition } = useJsonMutation();

  if (!canEdit) return null;

  const save = () => {
    if (!contactNo.trim()) {
      setError("Contact number is required");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await apiCall("/api/contacts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: contactId,
            name: name.trim() || null,
            contactNo: contactNo.trim(),
            remarks: remarks.trim() || null,
          }),
        });
        setEditing(false);
        refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save");
      }
    });
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex min-h-11 items-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted"
      >
        {contactsCopy.editContact}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <h3 className="font-heading text-sm font-semibold">{contactsCopy.editContact}</h3>
      <div>
        <label htmlFor="contact-edit-name" className="text-xs font-medium text-muted-foreground">Name</label>
        <input
          id="contact-edit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>
      <div>
        <label htmlFor="contact-edit-phone" className="text-xs font-medium text-muted-foreground">Contact number *</label>
        <input
          id="contact-edit-phone"
          type="tel"
          value={contactNo}
          onChange={(e) => setContactNo(e.target.value)}
          className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>
      <div>
        <label htmlFor="contact-edit-remarks" className="text-xs font-medium text-muted-foreground">Remarks</label>
        <input
          id="contact-edit-remarks"
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="mt-1 w-full min-h-11 rounded-lg border bg-transparent px-3 text-base md:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : contactsCopy.saveContact}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setName(initialName ?? "");
            setContactNo(initialContactNo);
            setRemarks(initialRemarks ?? "");
            setError(null);
          }}
          disabled={pending}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-input px-4 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
