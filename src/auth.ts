import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnLogin = nextUrl.pathname === "/login";
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/executive", nextUrl));
      }
      if (!isLoggedIn && !isOnLogin) return false;
      return true;
    },
    async signIn({ user }) {
      if (!user.email) return false;
      const [existing] = await db.select().from(users).where(eq(users.email, user.email)).limit(1);
      if (!existing) {
        await db.insert(users).values({
          id: randomUUID(),
          name: user.name ?? user.email,
          email: user.email,
          image: user.image ?? null,
          role: "staff",
          departmentId: null,
        });
      } else if (user.image && existing.image !== user.image) {
        await db.update(users).set({ image: user.image }).where(eq(users.id, existing.id));
      }
      return true;
    },
    async jwt({ token, trigger }) {
      if (trigger === "signIn" || trigger === "signUp" || !token.role) {
        if (token.email) {
          const [dbUser] = await db.select().from(users).where(eq(users.email, token.email)).limit(1);
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.departmentId = dbUser.departmentId ?? undefined;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "executive" | "director" | "staff";
        session.user.departmentId = token.departmentId as string | undefined;
      }
      return session;
    },
  },
});
