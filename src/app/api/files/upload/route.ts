import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageFaq } from "@/lib/faq-auth";
import { getPresignedUploadUrl, generateFileKey } from "@/lib/minio";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const FAQ_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 25 * 1024 * 1024;
const FAQ_MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename, contentType, size, namespace } = await request.json();

  if (namespace === "faq") {
    if (!(await canManageFaq(session.user.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!FAQ_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Only images are allowed for FAQ" }, { status: 400 });
    }
    if (size > FAQ_MAX_SIZE) {
      return NextResponse.json({ error: "Image must be under 5 MB" }, { status: 400 });
    }
    const key = generateFileKey(session.user.id, filename, "faq");
    const url = await getPresignedUploadUrl(key);
    return NextResponse.json({ url, key });
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  if (size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 25 MB)" }, { status: 400 });
  }

  const key = generateFileKey(session.user.id, filename);
  const url = await getPresignedUploadUrl(key);

  return NextResponse.json({ url, key });
}
