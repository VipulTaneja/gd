import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPresignedDownloadUrl } from "@/lib/minio";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");
  if (!fileId) return NextResponse.json({ error: "Missing file id" }, { status: 400 });

  const file = await db.fileEntry.findUnique({ where: { id: fileId } });
  if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const url = await getPresignedDownloadUrl(file.storageKey);
  return NextResponse.redirect(url);
}
