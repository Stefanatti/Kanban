import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/boards/[id] — get a single board with its lists and tasks
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const board = await prisma.board.findUnique({
      where: { id },
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

// PUT /api/boards/[id] — update a board
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
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

// DELETE /api/boards/[id] — delete a board (cascades to lists and tasks)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.board.delete({ where: { id } });
    return NextResponse.json({ message: "Board deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete board" },
      { status: 500 },
    );
  }
}
