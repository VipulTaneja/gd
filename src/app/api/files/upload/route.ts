import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl, generateFileKey } from "@/lib/minio";
import { getUploadNamespaceConfig, validateUpload } from "@/lib/upload-config";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, contentType, size, namespace } = await request.json();
  const config = getUploadNamespaceConfig(namespace);

  if (namespace === "faq" || namespace === "hub-hero") {
    if (!(await config.authGuard(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const validationError = validateUpload(contentType, size, namespace);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const key = generateFileKey(session.user.id, filename, config.keyPrefix || undefined);
  const url = await getPresignedUploadUrl(key);

  return NextResponse.json({ url, key });
}
