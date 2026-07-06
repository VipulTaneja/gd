export interface DirectoryResident {
  id: string;
  name: string;
  avatarUrl: string | null;
  unitNumber: string;
  block: string;
}

export interface DirectoryUnitSlot {
  unitId: string;
  unitNumber: string;
  block: string;
  residents: DirectoryResident[];
  isVacant: boolean;
}

export interface DirectoryFloorRow {
  floor: number;
  units: DirectoryUnitSlot[];
}

export interface DirectoryTowerData {
  block: string;
  floors: DirectoryFloorRow[];
  residentCount: number;
  vacantCount: number;
}

export interface DirectoryAlignedFloorRow {
  floor: number;
  columns: Array<{ block: string; units: DirectoryUnitSlot[] }>;
}

export interface DirectoryAlignedGrid {
  floors: DirectoryAlignedFloorRow[];
  towers: string[];
  residentCount: number;
  vacantCount: number;
}

export const DIRECTORY_TOWERS = ["A", "B", "C"] as const;
export const DIRECTORY_MIN_FLOOR = 1;
export const DIRECTORY_MAX_FLOOR = 34;

export function parseUnitFloor(unitNumber: string, floor: number | null): number {
  if (floor != null) return floor;
  const match = unitNumber.match(/^[ABC]-(\d{2})\d{2}$/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Unit index within a floor: 1 or 2 (last two digits of e.g. A-1202 → 2). */
export function parseUnitIndex(unitNumber: string): number {
  const match = unitNumber.match(/^[ABC]-\d{2}(\d{2})$/);
  return match ? parseInt(match[1], 10) : 0;
}

export function pickUnitSlot(
  units: DirectoryUnitSlot[],
  index: 1 | 2,
): DirectoryUnitSlot | null {
  return units.find((unit) => parseUnitIndex(unit.unitNumber) === index) ?? null;
}

type UnitRecord = {
  id: string;
  unitNumber: string;
  block: string;
  floor: number | null;
};

type MembershipRecord = {
  unitId: string;
  unit: { unitNumber: string; block: string; floor: number | null };
  user: { id: string; name: string; avatarUrl?: string | null };
};

function groupResidentsByUnit(memberships: MembershipRecord[]) {
  const map = new Map<string, Map<string, DirectoryResident>>();

  for (const m of memberships) {
    const residents = map.get(m.unitId) ?? new Map<string, DirectoryResident>();
    if (!residents.has(m.user.id)) {
      residents.set(m.user.id, {
        id: m.user.id,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl ?? null,
        unitNumber: m.unit.unitNumber,
        block: m.unit.block,
      });
    }
    map.set(m.unitId, residents);
  }

  const result = new Map<string, DirectoryResident[]>();
  for (const [unitId, residents] of map) {
    result.set(
      unitId,
      Array.from(residents.values()).sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  return result;
}

function toUnitSlot(unit: UnitRecord, residentsByUnit: Map<string, DirectoryResident[]>): DirectoryUnitSlot {
  const residents = residentsByUnit.get(unit.id) ?? [];
  return {
    unitId: unit.id,
    unitNumber: unit.unitNumber,
    block: unit.block,
    residents,
    isVacant: residents.length === 0,
  };
}

function countVacant(units: DirectoryUnitSlot[]) {
  return units.filter((unit) => unit.isVacant).length;
}

export function buildDirectoryTowers(
  units: UnitRecord[],
  memberships: MembershipRecord[],
  towerFilter?: string,
): DirectoryTowerData[] {
  const towers = towerFilter ? [towerFilter] : [...DIRECTORY_TOWERS];
  const residentsByUnit = groupResidentsByUnit(memberships);
  const result: DirectoryTowerData[] = [];

  for (const block of towers) {
    const towerUnits = units.filter((unit) => unit.block === block);
    if (towerUnits.length === 0) continue;

    const floorMap = new Map<number, DirectoryUnitSlot[]>();

    for (const unit of towerUnits) {
      const floor = parseUnitFloor(unit.unitNumber, unit.floor);
      const slots = floorMap.get(floor) ?? [];
      slots.push(toUnitSlot(unit, residentsByUnit));
      floorMap.set(floor, slots);
    }

    const floors = Array.from(floorMap.entries())
      .sort(([a], [b]) => b - a)
      .map(([floor, floorUnits]) => ({
        floor,
        units: floorUnits.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber)),
      }));

    const allSlots = floors.flatMap((row) => row.units);

    result.push({
      block,
      floors,
      residentCount: allSlots.reduce((count, slot) => count + slot.residents.length, 0),
      vacantCount: countVacant(allSlots),
    });
  }

  return result;
}

export function buildAlignedFloorGrid(
  units: UnitRecord[],
  memberships: MembershipRecord[],
): DirectoryAlignedGrid {
  const residentsByUnit = groupResidentsByUnit(memberships);
  const unitsByTowerFloor = new Map<string, DirectoryUnitSlot[]>();

  for (const unit of units) {
    if (!DIRECTORY_TOWERS.includes(unit.block as (typeof DIRECTORY_TOWERS)[number])) continue;
    const floor = parseUnitFloor(unit.unitNumber, unit.floor);
    const key = `${unit.block}-${floor}`;
    const slots = unitsByTowerFloor.get(key) ?? [];
    slots.push(toUnitSlot(unit, residentsByUnit));
    unitsByTowerFloor.set(key, slots);
  }

  for (const slots of unitsByTowerFloor.values()) {
    slots.sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
  }

  const floors: DirectoryAlignedFloorRow[] = [];

  for (let floor = DIRECTORY_MAX_FLOOR; floor >= DIRECTORY_MIN_FLOOR; floor--) {
    floors.push({
      floor,
      columns: DIRECTORY_TOWERS.map((block) => ({
        block,
        units: (unitsByTowerFloor.get(`${block}-${floor}`) ?? []).sort((a, b) =>
          a.unitNumber.localeCompare(b.unitNumber),
        ),
      })),
    });
  }

  const allSlots = floors.flatMap((row) => row.columns.flatMap((column) => column.units));

  return {
    floors,
    towers: [...DIRECTORY_TOWERS],
    residentCount: allSlots.reduce((count, slot) => count + slot.residents.length, 0),
    vacantCount: countVacant(allSlots),
  };
}

export const towerBalloonStyles: Record<
  string,
  { bubble: string; avatar: string; floorBadge: string; header: string; vacant: string }
> = {
  A: {
    bubble:
      "bg-gradient-to-b from-gold/20 to-gold/5 ring-gold/35 hover:ring-gold/60 hover:shadow-gold/20",
    avatar: "bg-gold/20 text-gold-dark",
    floorBadge: "bg-gold/15 text-gold-dark border-gold/25",
    header: "from-gold/25 via-gold/10 to-transparent border-gold/30",
    vacant: "border-dashed border-gold/40 bg-gold/5 text-gold-dark/70",
  },
  B: {
    bubble:
      "bg-gradient-to-b from-teal-100 to-teal-50 ring-teal-200 hover:ring-teal-400 hover:shadow-teal-200/50",
    avatar: "bg-teal-200 text-teal-900",
    floorBadge: "bg-teal-100 text-teal-800 border-teal-200",
    header: "from-teal-100/80 via-teal-50/50 to-transparent border-teal-200",
    vacant: "border-dashed border-teal-300 bg-teal-50/50 text-teal-700/70",
  },
  C: {
    bubble:
      "bg-gradient-to-b from-rose-100 to-rose-50 ring-rose-200 hover:ring-rose-400 hover:shadow-rose-200/50",
    avatar: "bg-rose-200 text-rose-900",
    floorBadge: "bg-rose-100 text-rose-800 border-rose-200",
    header: "from-rose-100/80 via-rose-50/50 to-transparent border-rose-200",
    vacant: "border-dashed border-rose-300 bg-rose-50/50 text-rose-700/70",
  },
};
