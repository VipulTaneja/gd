import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function PATCH(request: NextRequest) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const { userId, name, phone, emergencyContactName, emergencyContactPhone } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        phone: phone,
        emergencyContactName: emergencyContactName,
        emergencyContactPhone: emergencyContactPhone,
      },
    });

    await logAction(admin.userId, "USER_UPDATED", "User", userId, { fields: Object.keys({ name, phone, emergencyContactName, emergencyContactPhone }) });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update user" },
      { status: 500 }
    );
  }
}
