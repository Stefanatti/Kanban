"use client";
import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider wraps the app with NextAuth's SessionProvider.
 * This makes `useSession()` available in any client component,
 * so components can read the current user's session data.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
