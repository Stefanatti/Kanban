import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserId } from "@/lib/auth-utils";

export async function GET() {
  const userId = await getAuthUserId();
  if (userId instanceof NextResponse) return userId;
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }, select: { endpoint: true },
  });
  return NextResponse.json({ endpoints: subscriptions.map((item) => item.endpoint) });
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
  } catch {
    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 },
    );
  }
}
