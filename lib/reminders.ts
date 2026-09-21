import webPush from "web-push";
import { prisma } from "@/lib/prisma";

export async function sendDueReminders() {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_EMAIL;
  if (!publicKey || !privateKey || !subject || publicKey !== process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY) {
    throw new Error("Missing or inconsistent web push configuration");
  }
  webPush.setVapidDetails(subject, publicKey, privateKey);
  const now = new Date();
  const reminders = await prisma.taskReminder.findMany({
    where: { remindAt: { lte: now }, sentAt: null, cancelledAt: null },
    orderBy: { remindAt: "asc" }, take: 100, select: { id: true },
  });
  const counts = { sentCount: 0, pendingCount: 0, cancelledCount: 0 };
  for (const candidate of reminders) {
    if (Date.now() - now.getTime() > 40_000) break;
    const outcome = await prisma.$transaction(async (tx) => {
      // Lock across processes so overlapping scheduler calls cannot send together.
      const locked = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "TaskReminder"
        WHERE "id" = ${candidate.id} AND "sentAt" IS NULL AND "cancelledAt" IS NULL
        FOR UPDATE SKIP LOCKED
      `;
      if (!locked.length) return null;
      const reminder = await tx.taskReminder.findUnique({
        where: { id: candidate.id },
        include: { task: { include: { list: { include: { board: true } } } } },
      });
      if (!reminder || reminder.remindAt > now) return null;
      const task = reminder.task;
      if (task.completed || task.list.title.trim().toLowerCase() === "done" || !task.dueDate) {
        await tx.taskReminder.update({ where: { id: reminder.id }, data: { cancelledAt: now } });
        return "cancelledCount" as const;
      }
      const subscriptions = await tx.pushSubscription.findMany({ where: { userId: task.list.board.userId } });
      const payload = JSON.stringify({
        title: `Reminder: ${task.title}`,
        body: `Your task "${task.title}" is ${task.dueDate <= now ? "due" : "due soon"}.`,
        taskId: task.id, reminderId: reminder.id, dueDate: task.dueDate.toISOString(),
      });
      const results = await Promise.all(subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification({
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          }, payload, { timeout: 5000, TTL: 3600 });
          return true;
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await tx.pushSubscription.deleteMany({ where: { id: subscription.id } });
          }
          console.warn("Reminder push failed", { reminderId: reminder.id, status });
          return false;
        }
      }));
      // At least one device must accept delivery; otherwise retry on the next run.
      if (!results.some(Boolean)) return "pendingCount" as const;
      await tx.taskReminder.update({ where: { id: reminder.id }, data: { sentAt: new Date() } });
      return "sentCount" as const;
    }, { timeout: 15_000 });
    if (outcome) counts[outcome] += 1;
  }
  return { ...counts, checkedAt: now.toISOString() };
}
