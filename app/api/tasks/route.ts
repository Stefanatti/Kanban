import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";

// POST /api/tasks — create a new task
export async function POST(request: NextRequest) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;

    const body = await request.json();
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;
    const reminderMinutesBefore = body.reminderMinutesBefore;

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
    }

    if (
      reminderMinutesBefore !== null &&
      reminderMinutesBefore !== undefined &&
      (!dueDate ||
        !Number.isInteger(reminderMinutesBefore) ||
        reminderMinutesBefore < 0)
    ) {
      return NextResponse.json(
        { error: "A valid due date and reminder offset are required" },
        { status: 400 },
      );
    }

    const remindAt =
      dueDate &&
      reminderMinutesBefore !== null &&
      reminderMinutesBefore !== undefined
        ? new Date(dueDate.getTime() - reminderMinutesBefore * 60000)
        : null;

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate,
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
        reminders: remindAt ? { create: { remindAt } } : undefined,
      },
      include: { subtasks: true, reminders: true },
    });
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
