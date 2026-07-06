export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const APP_NAME = "Gulshan Dynasty";
export const APP_TAGLINE = "Your community. Your people. Your portal.";

export const UNIT_TOWERS = ["A", "B", "C"] as const;
export type Tower = (typeof UNIT_TOWERS)[number];

export const FLOORS_PER_TOWER = 34;
export const UNITS_PER_FLOOR = 2;
export const TOTAL_UNITS = 204;

export const ART_DECO = {
  colors: {
    charcoal: "#1a1a1a",
    gold: "#d4af37",
    goldLight: "#e8cd7a",
    goldDark: "#b8941f",
    warmWhite: "#faf8f5",
    warmGray: "#f0ede8",
  },
} as const;
