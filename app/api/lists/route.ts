import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/lists?boardId=xxx — get lists by board ID
export async function GET(request: NextRequest) {
  try {
    const boardId = request.nextUrl.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json(
        { error: "boardId query parameter is required" },
        { status: 400 },
      );
    }

    const lists = await prisma.list.findMany({
      where: { boardId },
      include: { tasks: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(lists);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 },
    );
  }
}

// POST /api/lists — create a new list
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const list = await prisma.list.create({
      data: {
        title: body.title,
        boardId: body.boardId,
      },
      include: { tasks: true },
    });
    return NextResponse.json(list, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 },
    );
  }
}
