import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPresignedUploadUrl, generateFileKey } from "@/lib/minio";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || !["SUPER_ADMIN", "ADMIN"].includes(user.globalRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename, mimeType, eventId, year } = await request.json();

  if (!filename || !mimeType || !eventId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const key = generateFileKey(session.user.id, `agm/${year || new Date().getFullYear()}/${filename}`);
  const uploadUrl = await getPresignedUploadUrl(key);

  const fileEntry = await db.fileEntry.create({
    data: {
      name: `AGM Minutes ${year || new Date().getFullYear()} - ${filename}`,
      mimeType,
      sizeBytes: 0,
      storageKey: key,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json({ uploadUrl, fileId: fileEntry.id, storageKey: key });
}
