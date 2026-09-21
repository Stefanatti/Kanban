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
      where: { id, list: { board: { userId: userIdOrResponse } } },
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
    if (body.listId !== undefined && (typeof body.listId !== "string" || !body.listId)) {
      return NextResponse.json({ error: "Invalid list" }, { status: 400 });
    }
    const currentTask = await prisma.task.findUnique({
      where: { id, list: { board: { userId: userIdOrResponse } } },
      include: {
        list: true,
        reminders: { where: { sentAt: null, cancelledAt: null }, orderBy: { createdAt: "desc" } },
      },
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
    const targetList = body.listId !== undefined
      ? await prisma.list.findFirst({ where: { id: body.listId, board: { userId: userIdOrResponse } } })
      : currentTask.list;
    if (!targetList) return NextResponse.json({ error: "List not found" }, { status: 404 });
    const activeReminder = currentTask.reminders[0];
    const reminderMinutesBefore = body.reminderMinutesBefore !== undefined
      ? body.reminderMinutesBefore
      : activeReminder && currentTask.dueDate && dueDate
        ? Math.max(0, (currentTask.dueDate.getTime() - activeReminder.remindAt.getTime()) / 60000)
        : null;
    const isCompleted = (body.completed ?? currentTask.completed) || targetList.title.trim().toLowerCase() === "done";
    const replaceReminder = body.reminderMinutesBefore !== undefined || body.dueDate !== undefined || isCompleted;

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
      !isCompleted && dueDate && reminderMinutesBefore !== null && reminderMinutesBefore !== undefined
        ? new Date(dueDate.getTime() - reminderMinutesBefore * 60000)
        : null;
    if (remindAt && Number.isNaN(remindAt.getTime())) {
      return NextResponse.json({ error: "Invalid reminder time" }, { status: 400 });
    }

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
        ...(replaceReminder && {
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
    await prisma.task.delete({ where: { id, list: { board: { userId: userIdOrResponse } } } });
    return NextResponse.json({ message: "Task deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
