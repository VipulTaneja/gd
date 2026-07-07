import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPublicFaq } from "@/lib/faq";

export async function GET() {
  const sections = await listPublicFaq();
  return NextResponse.json({ sections });
}
