/**
 * One-shot cleanup for duplicate seed data.
 * Keeps the oldest row per natural key and removes siblings.
 *
 * Run: npx tsx scripts/dedupe-seed-data.ts
 */
import { db } from "../src/lib/db";

async function dedupeNotices() {
  const groups = await db.notice.groupBy({
    by: ["title"],
    _count: { _all: true },
    having: { title: { _count: { gt: 1 } } },
  });

  let removed = 0;
  for (const g of groups) {
    const rows = await db.notice.findMany({
      where: { title: g.title },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    const [, ...dupes] = rows;
    if (dupes.length === 0) continue;
    const ids = dupes.map((r) => r.id);
    await db.noticeAcknowledgment.deleteMany({ where: { noticeId: { in: ids } } });
    await db.noticeRead.deleteMany({ where: { noticeId: { in: ids } } });
    const result = await db.notice.deleteMany({ where: { id: { in: ids } } });
    removed += result.count;
  }
  console.log(`Notices: removed ${removed} duplicate(s) across ${groups.length} title(s)`);
}

async function dedupePolls() {
  const groups = await db.poll.groupBy({
    by: ["title"],
    _count: { _all: true },
    having: { title: { _count: { gt: 1 } } },
  });

  let removed = 0;
  for (const g of groups) {
    const rows = await db.poll.findMany({
      where: { title: g.title },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        _count: { select: { votes: true } },
      },
    });

    // Keep the poll with the most votes; break ties by earliest createdAt (already sorted).
    const keep = rows.reduce((best, row) =>
      row._count.votes > best._count.votes ? row : best,
    );
    const dupes = rows.filter((r) => r.id !== keep.id);
    if (dupes.length === 0) continue;

    const ids = dupes.map((r) => r.id);
    await db.vote.deleteMany({ where: { pollId: { in: ids } } });
    await db.pollProxy.deleteMany({ where: { pollId: { in: ids } } });
    await db.pollOption.deleteMany({ where: { pollId: { in: ids } } });
    const result = await db.poll.deleteMany({ where: { id: { in: ids } } });
    removed += result.count;
  }
  console.log(`Polls: removed ${removed} duplicate(s) across ${groups.length} title(s)`);
}

const ROLE_RANK: Record<string, number> = {
  OWNER: 5,
  JOINT_OWNER: 4,
  TENANT: 3,
  OWNER_FAMILY: 2,
  TENANT_FAMILY: 1,
};

async function dedupeOpenUnitMemberships() {
  const open = await db.unitMembership.findMany({
    where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      userId: true,
      unitId: true,
      role: true,
      startDate: true,
      isPrimary: true,
    },
  });

  // Group by user+unit — a resident should have one open role per unit.
  const byUserUnit = new Map<string, typeof open>();
  for (const m of open) {
    const key = `${m.userId}|${m.unitId}`;
    const arr = byUserUnit.get(key) ?? [];
    arr.push(m);
    byUserUnit.set(key, arr);
  }

  let closed = 0;
  let promoted = 0;

  for (const rows of byUserUnit.values()) {
    if (rows.length <= 1) continue;

    const keep = rows.reduce((best, row) => {
      const bestRank = ROLE_RANK[best.role] ?? 0;
      const rowRank = ROLE_RANK[row.role] ?? 0;
      if (rowRank !== bestRank) return rowRank > bestRank ? row : best;
      if (row.isPrimary !== best.isPrimary) return row.isPrimary ? row : best;
      return row.startDate < best.startDate ? row : best;
    });

    const dupes = rows.filter((r) => r.id !== keep.id);
    if (dupes.length === 0) continue;

    if (!keep.isPrimary && rows.some((r) => r.isPrimary)) {
      await db.unitMembership.update({
        where: { id: keep.id },
        data: { isPrimary: true },
      });
      promoted++;
    }

    const result = await db.unitMembership.updateMany({
      where: { id: { in: dupes.map((r) => r.id) } },
      data: { endDate: new Date(), isPrimary: false },
    });
    closed += result.count;
  }

  if (closed === 0) {
    console.log("UnitMembership: no open duplicates");
  } else {
    console.log(
      `UnitMembership: closed ${closed} conflicting open membership(s)` +
        (promoted ? `, promoted ${promoted} to primary` : ""),
    );
  }
}

async function dedupeOpenDesignations() {
  const open = await db.designation.findMany({
    where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    orderBy: { startDate: "asc" },
    select: { id: true, userId: true, title: true },
  });

  const keep = new Set<string>();
  const closeIds: string[] = [];
  for (const d of open) {
    const key = `${d.userId}:${d.title}`;
    if (keep.has(key)) closeIds.push(d.id);
    else keep.add(key);
  }

  if (closeIds.length === 0) {
    console.log("Designation: no open duplicates");
    return;
  }

  const result = await db.designation.updateMany({
    where: { id: { in: closeIds } },
    data: { endDate: new Date() },
  });
  console.log(`Designation: closed ${result.count} open duplicate(s)`);
}

async function main() {
  console.log("Cleaning duplicate seed data…\n");
  await dedupeNotices();
  await dedupePolls();
  await dedupeOpenUnitMemberships();
  await dedupeOpenDesignations();

  const [notices, polls] = await Promise.all([db.notice.count(), db.poll.count()]);
  console.log(`\nRemaining: ${notices} notices, ${polls} polls`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
