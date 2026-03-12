import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth options used by the API route and getServerSession().
 * Credentials provider for demo: sign in with any email/password to get a session
 * (replace with real validation in production).
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email?.trim()) return null;
        // Demo: accept any non-empty email + password to create a session.
        // In production, validate against DB (e.g. lib/auth/password.verifyPassword).
        return {
          id: "demo-user-id",
          email: credentials.email.trim(),
          name: credentials.email.trim(),
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
};
