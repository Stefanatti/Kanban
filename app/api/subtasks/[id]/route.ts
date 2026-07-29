import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/subtasks/[id] — toggle isCompleted
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const subtask = await prisma.subtask.update({
      where: { id },
      data: {
        ...(body.isCompleted !== undefined && {
          isCompleted: body.isCompleted,
        }),
        ...(body.title !== undefined && { title: body.title }),
      },
    });

    return NextResponse.json(subtask);
  } catch {
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 },
    );
  }
}
