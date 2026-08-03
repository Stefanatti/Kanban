import type { NextAuthConfig } from "next-auth";

/**
 * Shared NextAuth configuration — Edge-runtime compatible.
 *
 * This file contains ONLY the config that does NOT depend on
 * Node.js modules (no Prisma, no bcrypt, no `pg`).
 *
 * It's used by:
 * 1. middleware.ts — for route protection (Edge runtime)
 * 2. lib/auth.ts — extended with Prisma adapter + Credentials provider (Node runtime)
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    /**
     * authorized: used by middleware to decide if a request is allowed.
     * Returns true if the user has a valid JWT token.
     */
    authorized({ auth }) {
      return !!auth?.user;
    },
    /**
     * jwt: enriches the JWT token with the user's ID.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    /**
     * session: copies the user ID from the JWT into the session object.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Providers are added in lib/auth.ts (Node runtime only)
} satisfies NextAuthConfig;
