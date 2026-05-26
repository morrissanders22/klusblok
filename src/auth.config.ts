import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = String(token.id ?? "");
        session.user.name = String(token.name ?? "");
        session.user.email = String(token.email ?? "");
        session.user.role = (token.role as "CONSUMER" | "CONTRACTOR" | "ADMIN") ?? "CONSUMER";
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      const adminOnly = ["/admin"];
      if (adminOnly.some((p) => nextUrl.pathname.startsWith(p))) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/login", nextUrl);
          loginUrl.searchParams.set("next", nextUrl.pathname);
          return Response.redirect(loginUrl);
        }
        return role === "ADMIN";
      }

      const protectedPaths = [
        "/dashboard",
        "/jobs",
        "/klussers",
        "/claims",
        "/payments",
        "/reviews",
        "/instellingen",
        "/word-klusser",
      ];
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p),
      );
      if (isProtected && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("next", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
