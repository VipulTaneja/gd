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
