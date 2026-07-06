import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const newValue = !user.allowDeliveriesToday;

  await db.user.update({
    where: { id: session.user.id },
    data: { allowDeliveriesToday: newValue },
  });

  return NextResponse.json({ success: true, allowDeliveriesToday: newValue });
}
