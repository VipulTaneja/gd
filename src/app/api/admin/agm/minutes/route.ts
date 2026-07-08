import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, isAdminApiError } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { getPresignedUploadUrl, generateFileKey } from "@/lib/minio";

export async function POST(request: NextRequest) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const { filename, mimeType, eventId, year } = await request.json();

  if (!filename || !mimeType || !eventId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const key = generateFileKey(admin.userId, `agm/${year || new Date().getFullYear()}/${filename}`);
  const uploadUrl = await getPresignedUploadUrl(key);

  const fileEntry = await db.fileEntry.create({
    data: {
      name: `AGM Minutes ${year || new Date().getFullYear()} - ${filename}`,
      mimeType,
      sizeBytes: 0,
      storageKey: key,
      uploadedById: admin.userId,
    },
  });

  return NextResponse.json({ uploadUrl, fileId: fileEntry.id, storageKey: key });
}
