import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteFile } from "@/lib/minio";
import { logAction } from "@/lib/audit";
import { isAdmin } from "@/lib/rbac";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await request.json();

  const file = await db.fileEntry.findUnique({ where: { id: fileId } });
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const admin = await isAdmin(session.user.id);
  if (file.uploadedById !== session.user.id && !admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteFile(file.storageKey);
  await db.fileEntry.delete({ where: { id: fileId } });
  await logAction(session.user.id, "FILE_DELETED", "FileEntry", fileId, { name: file.name });

  return NextResponse.json({ success: true });
}
