import type { DesignationTitle } from "@/generated/prisma/enums";

export const DESIGNATION_TITLES: DesignationTitle[] = [
  "PRESIDENT",
  "VICE_PRESIDENT",
  "SECRETARY",
  "TREASURER",
  "COMMITTEE_MEMBER",
];

export const designationTitleLabels: Record<DesignationTitle, string> = {
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice President",
  SECRETARY: "Secretary",
  TREASURER: "Treasurer",
  COMMITTEE_MEMBER: "Committee Member",
};

export function designationTitleLabel(title: DesignationTitle): string {
  return designationTitleLabels[title] ?? title;
}

/** A designation with no end date, or one ending in the future, is currently active. */
export function isActiveDesignation(endDate: Date | null, now: Date = new Date()): boolean {
  return !endDate || endDate > now;
}

/**
 * Active designations can be duplicated by re-seed / repeat admin create.
 * Prefer one row per user+title (or title alone if userId absent), keeping the earliest start.
 */
export function uniqueDesignationsByTitle<
  T extends { title: DesignationTitle; startDate: Date; userId?: string },
>(designations: T[]): T[] {
  const byKey = new Map<string, T>();
  for (const d of designations) {
    const key = d.userId ? `${d.userId}:${d.title}` : d.title;
    const existing = byKey.get(key);
    if (!existing || d.startDate < existing.startDate) {
      byKey.set(key, d);
    }
  }
  return [...byKey.values()].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

/** Form/API string values → enum */
export function parseDesignationTitle(value: string): DesignationTitle | null {
  const map: Record<string, DesignationTitle> = {
    President: "PRESIDENT",
    "Vice President": "VICE_PRESIDENT",
    Secretary: "SECRETARY",
    Treasurer: "TREASURER",
    "Committee Member": "COMMITTEE_MEMBER",
    PRESIDENT: "PRESIDENT",
    VICE_PRESIDENT: "VICE_PRESIDENT",
    SECRETARY: "SECRETARY",
    TREASURER: "TREASURER",
    COMMITTEE_MEMBER: "COMMITTEE_MEMBER",
  };
  return map[value.trim()] ?? null;
}
