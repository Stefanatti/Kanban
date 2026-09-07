import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-utils";

// GET /api/tasks/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: { subtasks: true, reminders: true },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 },
    );
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;

    const { id } = await params;
    const body = await request.json();
    const currentTask = await prisma.task.findUnique({
      where: { id },
      select: { dueDate: true },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const dueDate =
      body.dueDate !== undefined
        ? body.dueDate
          ? new Date(body.dueDate)
          : null
        : currentTask.dueDate;
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
      dueDate && reminderMinutesBefore !== null && reminderMinutesBefore !== undefined
        ? new Date(dueDate.getTime() - reminderMinutesBefore * 60000)
        : null;

    // Handle subtasks: delete existing and recreate
    if (body.subtasks !== undefined) {
      await prisma.subtask.deleteMany({ where: { taskId: id } });
      if (body.subtasks.length > 0) {
        await prisma.subtask.createMany({
          data: body.subtasks.map(
            (s: { title: string; isCompleted?: boolean }) => ({
              title: s.title,
              isCompleted: s.isCompleted ?? false,
              taskId: id,
            }),
          ),
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.dueDate !== undefined && {
          dueDate,
        }),
        ...(body.completed !== undefined && { completed: body.completed }),
        ...(body.listId !== undefined && { listId: body.listId }),
        ...(body.reminderMinutesBefore !== undefined && {
          reminders: {
            deleteMany: { sentAt: null },
            ...(remindAt && { create: { remindAt } }),
          },
        }),
      },
      include: { subtasks: true, reminders: true },
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 },
    );
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;

    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ message: "Task deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
