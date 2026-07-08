import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/minio";
import { isPublicMediaKey } from "@/lib/upload-config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || !key.startsWith("uploads/")) {
    return NextResponse.json({ error: "Invalid media key" }, { status: 400 });
  }

  if (!isPublicMediaKey(key)) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = await getPresignedDownloadUrl(key);
  return NextResponse.redirect(url);
}
