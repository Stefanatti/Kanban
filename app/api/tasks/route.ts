import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/tasks — create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        completed: body.completed ?? false,
        listId: body.listId,
        subtasks: body.subtasks?.length
          ? {
              create: body.subtasks.map((s: { title: string }) => ({
                title: s.title,
                isCompleted: false,
              })),
            }
          : undefined,
      },
      include: { subtasks: true },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
