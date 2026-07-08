"use client";

import { useState, useTransition } from "react";
import { Car, Plus, Trash2, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserLink } from "@/components/shared/user-link";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  vehicleTypeLabels,
  VEHICLE_TYPES,
} from "@/lib/unit-assets-labels";
import type { VehicleType } from "@/generated/prisma/enums";
import { createVehicle, deleteVehicle, updateVehicle } from "@/app/units/[unitNumber]/actions";

export interface UnitVehicleRow {
  id: string;
  vehicleType: VehicleType;
  registrationNumber: string;
  make: string | null;
  model: string | null;
  color: string | null;
  registeredByUser: { id: string; name: string };
}

interface UnitVehiclesSectionProps {
  unitNumber: string;
  vehicles: UnitVehicleRow[];
  canEdit: boolean;
}

const emptyForm = {
  vehicleType: "CAR" as VehicleType,
  registrationNumber: "",
  make: "",
  model: "",
  color: "",
};

export function UnitVehiclesSection({ unitNumber, vehicles, canEdit }: UnitVehiclesSectionProps) {
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

  const openEdit = (vehicle: UnitVehicleRow) => {
    setEditingId(vehicle.id);
    setForm({
      vehicleType: vehicle.vehicleType,
      registrationNumber: vehicle.registrationNumber,
      make: vehicle.make ?? "",
      model: vehicle.model ?? "",
      color: vehicle.color ?? "",
    });
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = editingId
        ? await updateVehicle(unitNumber, editingId, form)
        : await createVehicle(unitNumber, form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    });
  };

  const handleDelete = (vehicleId: string) => {
    setDeleteId(vehicleId);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteVehicle(unitNumber, deleteId);
      setDeleteId(null);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Car className="h-5 w-5 text-gold" />
          Vehicles ({vehicles.length})
        </CardTitle>
        {canEdit && (
          <Button type="button" size="sm" variant="outline" onClick={openCreate} className="min-h-11">
            <Plus className="h-4 w-4 mr-1" />
            Add vehicle
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {vehicles.length === 0 && !showForm && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No vehicles registered for this unit.
          </p>
        )}

        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="rounded-lg border p-3 text-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono font-semibold text-base tracking-wide">
                  {vehicle.registrationNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  Registered by{" "}
                  <UserLink userId={vehicle.registeredByUser.id} name={vehicle.registeredByUser.name} />
                </p>
              </div>
              {canEdit && (
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(vehicle)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
                    aria-label="Edit vehicle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vehicle.id)}
                    disabled={pending}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                    aria-label="Remove vehicle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{vehicleTypeLabels[vehicle.vehicleType]}</dd>
              </div>
              {vehicle.make && (
                <div>
                  <dt className="text-muted-foreground">Make</dt>
                  <dd className="font-medium">{vehicle.make}</dd>
                </div>
              )}
              {vehicle.model && (
                <div>
                  <dt className="text-muted-foreground">Model</dt>
                  <dd className="font-medium">{vehicle.model}</dd>
                </div>
              )}
              {vehicle.color && (
                <div>
                  <dt className="text-muted-foreground">Color</dt>
                  <dd className="font-medium">{vehicle.color}</dd>
                </div>
              )}
            </dl>
          </div>
        ))}

        {showForm && canEdit && (
          <form onSubmit={handleSubmit} className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="font-medium text-sm">{editingId ? "Edit vehicle" : "Register a vehicle"}</p>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="vehicle-reg" className="text-xs font-medium">Registration number *</label>
                <input
                  id="vehicle-reg"
                  required
                  value={form.registrationNumber}
                  onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}
                  placeholder="UP 16 AB 1234"
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm font-mono uppercase"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="vehicle-type" className="text-xs font-medium">Type *</label>
                <select
                  id="vehicle-type"
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                >
                  {VEHICLE_TYPES.map((t) => (
                    <option key={t} value={t}>{vehicleTypeLabels[t]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="vehicle-make" className="text-xs font-medium">Make</label>
                <input
                  id="vehicle-make"
                  value={form.make}
                  onChange={(e) => setForm({ ...form, make: e.target.value })}
                  placeholder="Honda, BMW…"
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="vehicle-model" className="text-xs font-medium">Model</label>
                <input
                  id="vehicle-model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="City, X5…"
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="vehicle-color" className="text-xs font-medium">Color</label>
                <input
                  id="vehicle-color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex h-11 w-full rounded-md border bg-background px-3 text-base md:text-sm"
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
        title="Remove this vehicle?"
        description="It will be removed from the unit registry."
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        pending={pending}
      />
    </Card>
  );
}
