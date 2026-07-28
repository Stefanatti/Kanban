import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/boards — get all boards
export async function GET() {
  try {
    const boards = await prisma.board.findMany({
      include: {
        lists: {
          include: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(boards);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 },
    );
  }
}

// POST /api/boards — create a new board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const board = await prisma.board.create({
      data: {
        title: body.title,
        lists: body.columns?.length
          ? {
              create: body.columns.map((col: string) => ({ title: col })),
            }
          : undefined,
      },
      include: {
        lists: {
          include: {
            tasks: true,
          },
        },
      },
    });
    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 },
    );
  }
}
