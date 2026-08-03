/**
 * NextAuth catch-all API route.
 * Handles: /api/auth/signin, /api/auth/signout, /api/auth/session, etc.
 * All auth HTTP methods (GET and POST) are forwarded to NextAuth's handlers.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
