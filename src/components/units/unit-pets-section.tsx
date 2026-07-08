"use client";

import { useState, useTransition } from "react";
import { PawPrint, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserLink } from "@/components/shared/user-link";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  petGenderLabels,
  petTypeLabels,
  PET_GENDERS,
  PET_TYPES,
} from "@/lib/unit-assets-labels";
import type { PetGender, PetType } from "@/generated/prisma/enums";
import { createPet, deletePet, updatePet } from "@/app/units/[unitNumber]/actions";

export interface UnitPetRow {
  id: string;
  name: string;
  petType: PetType;
  breed: string | null;
  color: string | null;
  ageYears: number | null;
  gender: PetGender;
  vaccinationExpiry: string | null;
  notes: string | null;
  user: { id: string; name: string };
}

interface UnitPetsSectionProps {
  unitNumber: string;
  pets: UnitPetRow[];
  canEdit: boolean;
}

const emptyForm = {
  name: "",
  petType: "DOG" as PetType,
  breed: "",
  color: "",
  ageYears: "",
  gender: "UNKNOWN" as PetGender,
  vaccinationExpiry: "",
  notes: "",
};

export function UnitPetsSection({ unitNumber, pets, canEdit }: UnitPetsSectionProps) {
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (pet: UnitPetRow) => {
    setEditingId(pet.id);
    setForm({
      name: pet.name,
      petType: pet.petType,
      breed: pet.breed ?? "",
      color: pet.color ?? "",
      ageYears: pet.ageYears != null ? String(pet.ageYears) : "",
      gender: pet.gender,
      vaccinationExpiry: pet.vaccinationExpiry ? pet.vaccinationExpiry.slice(0, 10) : "",
      notes: pet.notes ?? "",
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      petType: form.petType,
      breed: form.breed,
      color: form.color,
      ageYears: form.ageYears ? parseInt(form.ageYears, 10) : null,
      gender: form.gender,
      vaccinationExpiry: form.vaccinationExpiry || null,
      notes: form.notes,
    };

    startTransition(async () => {
      const res = editingId
        ? await updatePet(unitNumber, editingId, payload)
        : await createPet(unitNumber, payload);
      if (res.error) {
        setError(res.error);
        return;
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    });
  };

  const handleDelete = (petId: string) => {
    setDeleteId(petId);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      await deletePet(unitNumber, deleteId);
      setDeleteId(null);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-gold" />
          Pets ({pets.length})
        </CardTitle>
        {canEdit && (
          <Button type="button" size="sm" variant="outline" onClick={openCreate} className="min-h-11">
            <Plus className="h-4 w-4 mr-1" />
            Add pet
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {pets.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pets registered for this unit.
          </p>
        )}

        {pets.map((pet) => (
          <div key={pet.id} className="rounded-lg border p-3 text-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-base">{pet.name}</p>
                <p className="text-xs text-muted-foreground">
                  Registered by <UserLink userId={pet.user.id} name={pet.user.name} />
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(pet)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
                    aria-label="Edit pet"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pet.id)}
                    disabled={pending}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                    aria-label="Remove pet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{petTypeLabels[pet.petType]}</dd>
              </div>
              {pet.breed && (
                <div>
                  <dt className="text-muted-foreground">Breed</dt>
                  <dd className="font-medium">{pet.breed}</dd>
                </div>
              )}
              {pet.color && (
                <div>
                  <dt className="text-muted-foreground">Color</dt>
                  <dd className="font-medium">{pet.color}</dd>
                </div>
              )}
              {pet.ageYears != null && (
                <div>
                  <dt className="text-muted-foreground">Age</dt>
                  <dd className="font-medium">{pet.ageYears} yr{pet.ageYears !== 1 ? "s" : ""}</dd>
                </div>
              )}
              {pet.gender !== "UNKNOWN" && (
                <div>
                  <dt className="text-muted-foreground">Gender</dt>
                  <dd className="font-medium">{petGenderLabels[pet.gender]}</dd>
                </div>
              )}
              {pet.vaccinationExpiry && (
                <div>
                  <dt className="text-muted-foreground">Vaccination due</dt>
                  <dd className="font-medium">
                    {new Date(pet.vaccinationExpiry).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
            {pet.notes && (
              <p className="text-xs text-muted-foreground border-t pt-2">{pet.notes}</p>
            )}
          </div>
        ))}

        {showForm && canEdit && (
          <form onSubmit={handleSubmit} className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="font-medium text-sm">{editingId ? "Edit pet" : "Register a pet"}</p>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="pet-name" className="text-xs font-medium">Name *</label>
                <input
                  id="pet-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="pet-type" className="text-xs font-medium">Type *</label>
                <select
                  id="pet-type"
                  value={form.petType}
                  onChange={(e) => setForm({ ...form, petType: e.target.value as PetType })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                >
                  {PET_TYPES.map((t) => (
                    <option key={t} value={t}>{petTypeLabels[t]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="pet-breed" className="text-xs font-medium">Breed</label>
                <input
                  id="pet-breed"
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="pet-color" className="text-xs font-medium">Color</label>
                <input
                  id="pet-color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="pet-age" className="text-xs font-medium">Age (years)</label>
                <input
                  id="pet-age"
                  type="number"
                  min={0}
                  max={30}
                  value={form.ageYears}
                  onChange={(e) => setForm({ ...form, ageYears: e.target.value })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="pet-gender" className="text-xs font-medium">Gender</label>
                <select
                  id="pet-gender"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as PetGender })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                >
                  {PET_GENDERS.map((g) => (
                    <option key={g} value={g}>{petGenderLabels[g]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="pet-vax" className="text-xs font-medium">Vaccination expiry</label>
                <input
                  id="pet-vax"
                  type="date"
                  value={form.vaccinationExpiry}
                  onChange={(e) => setForm({ ...form, vaccinationExpiry: e.target.value })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="pet-notes" className="text-xs font-medium">Notes</label>
                <textarea
                  id="pet-notes"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="flex w-full rounded-md border bg-background px-3 py-2 text-base md:text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending} className="bg-gold text-black hover:bg-gold-light">
                {pending ? "Saving…" : editingId ? "Update" : "Register"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remove this pet?"
        description="It will be removed from the unit registry."
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        pending={pending}
      />
    </Card>
  );
}
