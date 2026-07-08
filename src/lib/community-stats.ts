import { Home, Building2, Leaf, MapPin, type LucideIcon } from "lucide-react";
import { TOTAL_UNITS, UNIT_TOWERS } from "@/lib/constants";

export const communityStats: { icon: LucideIcon; label: string }[] = [
  { icon: Home, label: `${TOTAL_UNITS} homes` },
  { icon: Building2, label: `${UNIT_TOWERS.length} towers` },
  { icon: Leaf, label: "IGBC Platinum" },
  { icon: MapPin, label: "5.8 acres" },
];
