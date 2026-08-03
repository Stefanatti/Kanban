import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Helper to get the authenticated user's ID from the session.
 * Returns the userId string, or a 401 NextResponse if not authenticated.
 *
 * Usage in API routes:
 *   const userIdOrResponse = await getAuthUserId();
 *   if (userIdOrResponse instanceof NextResponse) return userIdOrResponse;
 *   const userId = userIdOrResponse;
 */
export async function getAuthUserId(): Promise<string | NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return session.user.id;
}
