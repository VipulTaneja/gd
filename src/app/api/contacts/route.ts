import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { category, typeOfService, name, contactNo, remarks } = await request.json();

  if (!category || !typeOfService || !contactNo) {
    return NextResponse.json({ error: "Category, service type, and contact number are required" }, { status: 400 });
  }

  try {
    const contact = await db.importantContact.create({
      data: {
        category,
        typeOfService,
        name: name || null,
        contactNo,
        remarks: remarks || null,
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CONTACT_CREATED",
        entityType: "ImportantContact",
        entityId: contact.id,
        metadata: { category, typeOfService, contactNo },
      },
    });

    return NextResponse.json({ success: true, id: contact.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create contact" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, name, contactNo, remarks } = await request.json();

  if (!id || !contactNo) {
    return NextResponse.json({ error: "ID and contact number are required" }, { status: 400 });
  }

  try {
    const contact = await db.importantContact.findUnique({ where: { id } });
    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    await db.importantContact.update({
      where: { id },
      data: {
        name: name || null,
        contactNo,
        remarks: remarks || null,
        lastEditedById: session.user.id,
        lastEditedAt: new Date(),
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CONTACT_UPDATED",
        entityType: "ImportantContact",
        entityId: id,
        metadata: { contactNo, name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update contact" },
      { status: 500 }
    );
  }
}
