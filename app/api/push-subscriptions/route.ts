import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";

function subscriptionError(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  // Do not log the subscription keys, endpoint, or database connection string.
  console.error("Push subscription storage failed", { code: code ?? "UNKNOWN" });
  if (code === "P2021" || code === "P2022") {
    return NextResponse.json({
      error: "Reminder storage is not ready. The production database migrations need to be applied.",
      code: "REMINDER_STORAGE_NOT_READY",
    }, { status: 503 });
  }
  return NextResponse.json({
    error: "Could not save or check this device for reminders. Please try again later.",
    code: "SUBSCRIPTION_STORAGE_FAILED",
  }, { status: 500 });
}

export async function GET() {
  try {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }, select: { endpoint: true },
  });
  return NextResponse.json({ endpoints: subscriptions.map((item) => item.endpoint) });
  } catch (error) {
    return subscriptionError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userIdOrResponse = await getAuthUserId();
    if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;
    const userId = userIdOrResponse;

    const body = await request.json();
    const { subscription, userAgent } = body ?? {};

    if (
      typeof subscription?.endpoint !== "string" ||
      typeof subscription?.keys?.p256dh !== "string" ||
      typeof subscription?.keys?.auth !== "string" ||
      (userAgent !== undefined && typeof userAgent !== "string")
    ) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 },
      );
    }

    let endpoint: URL;
    try {
      endpoint = new URL(subscription.endpoint);
    } catch {
      return NextResponse.json({ error: "Invalid push endpoint" }, { status: 400 });
    }
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password ||
        Buffer.from(subscription.keys.p256dh, "base64url").length !== 65 ||
        Buffer.from(subscription.keys.auth, "base64url").length !== 16) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const created = await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent ?? null,
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: userAgent ?? null,
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    return subscriptionError(error);
  }
}
