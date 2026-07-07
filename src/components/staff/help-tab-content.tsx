"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Building2, Loader2, Plus, UserMinus, UserPlus, UserRound } from "lucide-react";
import { StaffLink } from "@/components/staff/staff-link";
import { StaffAssociateForm } from "@/components/staff/staff-associate-form";
import { UnitLink } from "@/components/shared/unit-link";
import { EmptyState } from "@/components/shared/empty-state";
import { StarRatingDisplay } from "@/components/shared/star-rating-display";
import { staffRoleLabel, isSocietyStaffRole } from "@/lib/staff-labels";
import { STAFF_ROLE_FILTER_ORDER, staffRoleStyle } from "@/lib/staff-role-style";
import { staff as staffCopy } from "@/lib/microcopy";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/generated/prisma/enums";

interface UnitOption {
  id: string;
  unitNumber: string;
}

interface StaffEntry {
  associationId: string;
  staffPersonId: string;
  name: string;
  role: StaffRole;
  scope?: "UNIT" | "SOCIETY";
  unitId?: string | null;
  unitNumber: string | null;
  recurrenceDays: string[];
  avgRating: number | null;
  reviewCount: number;
  isMyUnit?: boolean;
  canManage?: boolean;
  canAddToMyUnit?: boolean;
}

interface StaffUnitLink {
  associationId: string;
  unitNumber: string;
  role: StaffRole;
  recurrenceDays: string[];
  isMyUnit: boolean;
  canManage: boolean;
}

interface StaffCard {
  staffPersonId: string;
  name: string;
  roles: StaffRole[];
  displayRole: StaffRole;
  units: StaffUnitLink[];
  hasSociety: boolean;
  isSocietyOnly: boolean;
  avgRating: number | null;
  reviewCount: number;
  isOnMyUnit: boolean;
  myAssociationId: string | null;
  canRemove: boolean;
  canAdd: boolean;
  addRole: StaffRole;
  recurrenceDays: string[];
}

type ScopeFilter = "all" | "my-unit";

interface HelpTabContentProps {
  units: UnitOption[];
}

function formatDays(days: string[]): string {
  if (days.length === 0) return "";
  const labels: Record<string, string> = {
    MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat", SUN: "Sun",
  };
  return days.map((d) => labels[d] ?? d).join(" · ");
}

function formatRoles(roles: StaffRole[]): string {
  const unique = [...new Set(roles)];
  if (unique.length === 1) return staffRoleLabel(unique[0]);
  return unique.map((r) => staffRoleLabel(r).split(" / ")[0]).join(" · ");
}

function groupStaffEntries(entries: StaffEntry[]): StaffCard[] {
  const map = new Map<
    string,
    {
      name: string;
      avgRating: number | null;
      reviewCount: number;
      units: StaffUnitLink[];
      societyRoles: StaffRole[];
      allRoles: Set<StaffRole>;
      canAdd: boolean;
    }
  >();

  for (const e of entries) {
    if (!map.has(e.staffPersonId)) {
      map.set(e.staffPersonId, {
        name: e.name,
        avgRating: e.avgRating,
        reviewCount: e.reviewCount,
        units: [],
        societyRoles: [],
        allRoles: new Set(),
        canAdd: false,
      });
    }
    const g = map.get(e.staffPersonId)!;
    g.allRoles.add(e.role);
    if (e.canAddToMyUnit) g.canAdd = true;

    if (e.scope === "SOCIETY" || isSocietyStaffRole(e.role)) {
      if (!g.societyRoles.includes(e.role)) g.societyRoles.push(e.role);
    } else if (e.unitNumber) {
      if (!g.units.some((u) => u.associationId === e.associationId)) {
        g.units.push({
          associationId: e.associationId,
          unitNumber: e.unitNumber,
          role: e.role,
          recurrenceDays: e.recurrenceDays,
          isMyUnit: !!e.isMyUnit,
          canManage: !!e.canManage,
        });
      }
    }
  }

  return Array.from(map.entries())
    .map(([staffPersonId, g]) => {
      const roles = [...g.allRoles];
      const displayRole = g.units[0]?.role ?? g.societyRoles[0] ?? roles[0] ?? "OTHER";
      const isOnMyUnit = g.units.some((u) => u.isMyUnit);
      const myAssoc = g.units.find((u) => u.isMyUnit && u.canManage);
      const hasSociety = g.societyRoles.length > 0;
      const isSocietyOnly = hasSociety && g.units.length === 0;
      const sortedUnits = [...g.units].sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
      const myUnitAssoc = g.units.find((u) => u.isMyUnit);

      return {
        staffPersonId,
        name: g.name,
        roles,
        displayRole,
        units: sortedUnits,
        hasSociety,
        isSocietyOnly,
        avgRating: g.avgRating,
        reviewCount: g.reviewCount,
        isOnMyUnit,
        myAssociationId: myAssoc?.associationId ?? null,
        canRemove: !!myAssoc,
        canAdd: !isOnMyUnit && !isSocietyOnly && g.canAdd,
        addRole: sortedUnits[0]?.role ?? displayRole,
        recurrenceDays: myUnitAssoc?.recurrenceDays ?? sortedUnits[0]?.recurrenceDays ?? [],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function HelpTabContent({ units }: HelpTabContentProps) {
  const [staff, setStaff] = useState<StaffEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "all">("all");
  const [addTarget, setAddTarget] = useState<string | null>(null);
  const [addUnitId, setAddUnitId] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff ?? []);
      } else if (res.status === 403) {
        setLoadError("Your account must be approved before you can view regular help.");
      } else {
        setLoadError("Could not load regular help. Try refreshing the page.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const defaultUnitId = units[0]?.id ?? "";

  const staffCards = useMemo(() => groupStaffEntries(staff), [staff]);

  const roleCounts = useMemo(() => {
    const counts = new Map<StaffRole, number>();
    for (const card of staffCards) {
      for (const role of card.roles) {
        counts.set(role, (counts.get(role) ?? 0) + 1);
      }
    }
    return counts;
  }, [staffCards]);

  const filteredStaff = useMemo(() => {
    return staffCards.filter((card) => {
      if (scopeFilter === "my-unit" && !card.isOnMyUnit) return false;
      if (roleFilter !== "all" && !card.roles.includes(roleFilter)) return false;
      return true;
    });
  }, [staffCards, scopeFilter, roleFilter]);

  const myUnitCount = useMemo(
    () => staffCards.filter((c) => c.isOnMyUnit).length,
    [staffCards],
  );

  const endAssociation = (staffPersonId: string, associationId: string) => {
    if (!confirm(staffCopy.endConfirm)) return;
    startTransition(async () => {
      const res = await fetch(`/api/staff/${staffPersonId}/associations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ associationId }),
      });
      if (res.ok) await loadStaff();
    });
  };

  const submitAddToUnit = (card: StaffCard) => {
    const unitId = addUnitId || defaultUnitId;
    if (!unitId) return;
    setAddError(null);
    startTransition(async () => {
      const res = await fetch(`/api/staff/${card.staffPersonId}/associations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          role: card.addRole,
          recurrenceDays: card.recurrenceDays.length > 0
            ? card.recurrenceDays
            : ["MON", "TUE", "WED", "THU", "FRI", "SAT"],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error ?? "Could not add to your unit");
        return;
      }
      setAddTarget(null);
      await loadStaff();
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {units.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-medium text-black hover:bg-gold-light sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {staffCopy.addHelp}
          </button>
        )}
      </div>

      {showAdd && units.length > 0 && (
        <StaffAssociateForm
          units={units}
          onSuccess={() => { setShowAdd(false); loadStaff(); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {loadError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}

      {staffCards.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto flex-nowrap snap-x snap-mandatory scrollbar-hide pb-1">
            {([
              ["all", staffCopy.filterAllHelp, staffCards.length],
              ["my-unit", staffCopy.filterMyUnit, myUnitCount],
            ] as const).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setScopeFilter(key)}
                className={cn(
                  "inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors",
                  scopeFilter === key
                    ? "bg-gold text-black"
                    : "border border-input hover:bg-muted",
                )}
              >
                {label}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                  scopeFilter === key ? "bg-black/10" : "bg-muted text-muted-foreground",
                )}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto flex-nowrap snap-x snap-mandatory scrollbar-hide pb-1">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={cn(
                "inline-flex min-h-9 shrink-0 snap-start items-center rounded-full px-3.5 text-sm font-medium transition-colors",
                roleFilter === "all"
                  ? "bg-gold text-black"
                  : "border border-input hover:bg-muted",
              )}
            >
              {staffCopy.filterAllTypes}
            </button>
            {STAFF_ROLE_FILTER_ORDER.map((role) => {
              const count = roleCounts.get(role) ?? 0;
              if (count === 0) return null;
              const style = staffRoleStyle(role);
              const Icon = style.icon;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors ring-1 ring-transparent",
                    roleFilter === role
                      ? style.pillActive
                      : "border border-input hover:bg-muted",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">{staffRoleLabel(role).split(" / ")[0]}</span>
                  <span className="text-[10px] opacity-70 tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filteredStaff.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={UserRound}
            title={staffCards.length === 0 ? staffCopy.noStaff : "No matches"}
            description={
              staffCards.length === 0
                ? staffCopy.noStaffHint
                : "Try a different filter or browse all help."
            }
          />
          {staffCards.length === 0 && units.length > 0 && !showAdd && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-semibold text-black hover:bg-gold-light"
              >
                {staffCopy.addHelp}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStaff.map((card) => {
            const style = staffRoleStyle(card.displayRole);
            const Icon = style.icon;
            const showRemove = card.canRemove;
            const showAdd = card.canAdd;
            const isAdding = addTarget === card.staffPersonId;

            return (
              <article
                key={card.staffPersonId}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-foreground/5 transition-shadow hover:shadow-md"
              >
                <div className={cn("absolute left-0 top-0 h-full w-1", style.line)} />

                <div className="flex flex-1 flex-col p-3 pl-3.5">
                  <div className="flex items-start gap-2">
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", style.iconBg)}>
                      <Icon className={cn("h-4 w-4", style.iconColor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <StaffLink
                        staffId={card.staffPersonId}
                        name={card.name}
                        showAvatar
                        className="font-heading text-sm font-semibold leading-tight hover:underline"
                      />
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">
                        {formatRoles(card.roles)}
                      </p>
                    </div>
                    {(showRemove || showAdd) && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        {showAdd && !isAdding && (
                          <button
                            type="button"
                            title={staffCopy.addToMyUnit}
                            aria-label={staffCopy.addToMyUnit}
                            onClick={() => {
                              if (units.length === 1 && defaultUnitId) {
                                submitAddToUnit(card);
                                return;
                              }
                              setAddTarget(card.staffPersonId);
                              setAddError(null);
                              setAddUnitId(defaultUnitId);
                            }}
                            disabled={pending || units.length === 0}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gold hover:bg-gold/10 disabled:opacity-50"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        )}
                        {showRemove && card.myAssociationId && (
                          <button
                            type="button"
                            title={staffCopy.endAssociation}
                            aria-label={staffCopy.endAssociation}
                            onClick={() => endAssociation(card.staffPersonId, card.myAssociationId!)}
                            disabled={pending}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      {card.isSocietyOnly ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {staffCopy.societyWide}
                        </span>
                      ) : (
                        <>
                          {card.units.map((u, i) => (
                            <span key={u.associationId} className="inline-flex items-center">
                              {i > 0 && <span className="mr-1.5 text-[11px] text-muted-foreground">·</span>}
                              <UnitLink unitNumber={u.unitNumber} className="text-[11px]" />
                            </span>
                          ))}
                          {card.hasSociety && card.units.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                              <span>·</span>
                              <Building2 className="h-3 w-3" />
                              {staffCopy.societyWide}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    {card.avgRating != null && (
                      <StarRatingDisplay
                        rating={card.avgRating}
                        reviewCount={card.reviewCount}
                        size="sm"
                        className="shrink-0"
                      />
                    )}
                  </div>

                  {card.recurrenceDays.length > 0 && (
                    <p className="mt-1.5 text-[10px] text-muted-foreground line-clamp-1">
                      {formatDays(card.recurrenceDays)}
                    </p>
                  )}

                  {showAdd && isAdding && (
                    <div className="mt-2 space-y-2 rounded-lg border bg-muted/30 p-2">
                      {units.length > 1 && (
                        <select
                          value={addUnitId || defaultUnitId}
                          onChange={(e) => setAddUnitId(e.target.value)}
                          className="w-full min-h-9 rounded-md border bg-background px-2 text-xs"
                        >
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>{u.unitNumber}</option>
                          ))}
                        </select>
                      )}
                      {addError && (
                        <p className="text-[10px] text-destructive">{addError}</p>
                      )}
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => submitAddToUnit(card)}
                          disabled={pending}
                          className="flex-1 min-h-9 rounded-md bg-gold text-xs font-medium text-black hover:bg-gold-light disabled:opacity-50"
                        >
                          {pending ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : staffCopy.addToMyUnit}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAddTarget(null); setAddError(null); }}
                          disabled={pending}
                          className="min-h-9 rounded-md border px-2 text-xs hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
