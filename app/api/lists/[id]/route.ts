import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";

// GET /api/lists/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;

    const { id } = await params;
    const list = await prisma.list.findUnique({
      where: { id },
      include: {
        tasks: { include: { subtasks: true, reminders: true } },
      },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json(list);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 },
    );
  }
}

// PATCH /api/lists/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;

    const { id } = await params;
    const body = await request.json();
    const list = await prisma.list.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
      },
      include: {
        tasks: { include: { subtasks: true, reminders: true } },
      },
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 },
    );
  }
}

// DELETE /api/lists/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;

    const { id } = await params;
    await prisma.list.delete({ where: { id } });
    return NextResponse.json({ message: "List deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 },
    );
  }
}
