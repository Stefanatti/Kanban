import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";

// GET /api/boards/[id] — get a single board (only if it belongs to the user)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;
    const userId = userIdOrResponse;

    const { id } = await params;
    const board = await prisma.board.findFirst({
      where: { id, userId },
      include: {
        lists: {
          include: {
            tasks: {
              include: { subtasks: true },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 },
    );
  }
}

// PUT /api/boards/[id] — update a board (only if it belongs to the user)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;
    const userId = userIdOrResponse;

    const { id } = await params;
    const body = await request.json();

    // Verify the board belongs to this user
    const existing = await prisma.board.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const board = await prisma.board.update({
      where: { id },
      data: {
        title: body.title,
      },
      include: {
        lists: {
          include: {
            tasks: {
              include: { subtasks: true },
            },
          },
        },
      },
    });
    return NextResponse.json(board);
  } catch {
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 },
    );
  }
}

// DELETE /api/boards/[id] — delete a board (only if it belongs to the user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;
    const userId = userIdOrResponse;

    const { id } = await params;

    // Verify the board belongs to this user
    const existing = await prisma.board.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    await prisma.board.delete({ where: { id } });
    return NextResponse.json({ message: "Board deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 },
    );
  }
}
