import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";

// GET /api/boards — get all boards FOR THE LOGGED-IN USER
export async function GET() {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;
    const userId = userIdOrResponse;

    const boards = await prisma.board.findMany({
      where: { userId },
      include: {
        lists: {
          include: {
            tasks: {
              include: {
                subtasks: true,
                reminders: {
                  where: { sentAt: null, cancelledAt: null },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(boards);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 },
    );
  }
}

// POST /api/boards — create a new board FOR THE LOGGED-IN USER
export async function POST(request: NextRequest) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;
    const userId = userIdOrResponse;

    const body = await request.json();
    const board = await prisma.board.create({
      data: {
        title: body.title,
        userId,
        lists: body.columns?.length
          ? {
              create: body.columns.map((col: string) => ({ title: col })),
            }
          : undefined,
      },
      include: {
        lists: {
          include: {
            tasks: {
              include: {
                subtasks: true,
                reminders: {
                  where: { sentAt: null, cancelledAt: null },
                },
              },
            },
          },
        },
      },
    });
    return NextResponse.json(board, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 },
    );
  }
}
