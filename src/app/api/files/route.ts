import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, mimeType, sizeBytes, storageKey, subCommunityId } = await request.json();

  const file = await db.fileEntry.create({
    data: {
      name,
      mimeType,
      sizeBytes,
      storageKey,
      subCommunityId: subCommunityId || null,
      uploadedById: session.user.id,
    },
  });

  await logAction(session.user.id, "FILE_UPLOADED", "FileEntry", file.id, { name, subCommunityId });

  return NextResponse.json({ success: true, id: file.id });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subCommunityId = searchParams.get("subCommunityId");

  const where: Record<string, unknown> = subCommunityId
    ? { subCommunityId }
    : { subCommunityId: null };

  const files = await db.fileEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}
