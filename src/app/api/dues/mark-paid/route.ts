import { NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const { dueId } = await request.json();

  await db.due.update({
    where: { id: dueId },
    data: { status: "PAID", paidAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
