export const LEADER_AUDIT_PRESETS = {
  unit: {
    label: "Unit leader",
    actions: [
      "UNIT_LEADER_ASSIGNED",
      "UNIT_LEADER_REMOVED",
      "UNIT_INVITE_SENT",
      "UNIT_INVITE_ACCEPTED",
      "UNIT_INVITE_DECLINED",
      "UNIT_INVITE_CANCELLED",
      "UNIT_ADMIN_INVITE_SENT",
      "TENANT_INVITE_OWNER_CONSENT",
    ],
  },
  community: {
    label: "Community leader",
    actions: [
      "COMMUNITY_CREATED",
      "COMMUNITY_UPDATED",
      "COMMUNITY_ARCHIVED",
      "COMMUNITY_ADMIN_ASSIGNED",
      "COMMUNITY_MEMBER_REMOVED",
    ],
  },
  amenity: {
    label: "Amenity leader",
    actions: ["FACILITY_BOOKING_APPROVED", "FACILITY_BOOKING_REJECTED"],
  },
} as const;

export type LeaderAuditPresetKey = keyof typeof LEADER_AUDIT_PRESETS;

export function getLeaderAuditPresetActions(preset: string): string[] | null {
  if (preset in LEADER_AUDIT_PRESETS) {
    return [...LEADER_AUDIT_PRESETS[preset as LeaderAuditPresetKey].actions];
  }
  return null;
}
