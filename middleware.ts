import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";

/**
 * Lightweight auth export for middleware.
 * Uses only auth.config (no Prisma, no bcrypt, no Node.js modules).
 * This is Edge-runtime compatible.
 */
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - /login and /signup (auth pages — must be accessible)
     * - /api/auth/* (NextAuth's own API routes)
     * - /api/reminders (authenticates the scheduler secret in its handler)
     * - /sw.js (service worker must be available without a login redirect)
     * - /_next/* (Next.js internals: JS bundles, CSS, etc.)
     * - /favicon.ico, /images/* (static assets)
     */
    "/((?!login|signup|api/auth|api/reminders$|sw\\.js$|_next|favicon.ico|images).*)",
  ],
};
