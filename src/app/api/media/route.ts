import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedDownloadUrl } from "@/lib/minio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key || !key.startsWith("uploads/")) {
    return NextResponse.json({ error: "Invalid media key" }, { status: 400 });
  }

  const isPublicHeroImage = key.startsWith("uploads/hub-hero/");

  if (!isPublicHeroImage) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = await getPresignedDownloadUrl(key);
  return NextResponse.redirect(url);
}
