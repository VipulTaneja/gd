"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    throw new Error("Forbidden");
  }
  return user;
}

function toCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(","));
  }
  return lines.join("\n");
}

export async function exportMembers(): Promise<string> {
  await requireAdmin();
  const memberships = await db.unitMembership.findMany({
    where: { OR: [{ endDate: null }, { endDate: { gt: new Date() } }] },
    include: {
      user: { select: { name: true, email: true } },
      unit: { select: { unitNumber: true } },
    },
  });

  return toCsv(
    memberships.map((m) => ({
      name: m.user.name,
      email: m.user.email,
      unit: m.unit.unitNumber,
      role: m.role,
      startDate: m.startDate.toISOString(),
      endDate: m.endDate?.toISOString() ?? "",
      isPrimary: m.isPrimary,
    })),
    ["name", "email", "unit", "role", "startDate", "endDate", "isPrimary"],
  );
}

export async function exportDues(): Promise<string> {
  await requireAdmin();
  const dues = await db.due.findMany({
    include: { unit: { select: { unitNumber: true } } },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    dues.map((d) => ({
      unit: d.unit.unitNumber,
      label: d.label,
      amount: d.amount.toString(),
      dueDate: d.dueDate.toISOString(),
      status: d.status,
      paidAt: d.paidAt?.toISOString() ?? "",
    })),
    ["unit", "label", "amount", "dueDate", "status", "paidAt"],
  );
}

export async function exportTickets(): Promise<string> {
  await requireAdmin();
  const tickets = await db.helpTicket.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    tickets.map((t) => ({
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      createdBy: t.user.name,
      email: t.user.email,
      createdAt: t.createdAt.toISOString(),
      resolvedAt: t.resolvedAt?.toISOString() ?? "",
    })),
    ["subject", "category", "priority", "status", "createdBy", "email", "createdAt", "resolvedAt"],
  );
}
