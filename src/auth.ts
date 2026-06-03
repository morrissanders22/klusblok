import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function getSecret() {
  const raw = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!raw) throw new Error("AUTH_SECRET ontbreekt");
  return new TextEncoder().encode(raw);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Wachtwoord", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    // Admin impersonation: takes a short-lived signed nonce (minted by an
    // authenticated admin server action). Verifies the nonce contains a valid
    // admin id + target user id, then signs in AS the target while recording
    // the original admin in `impersonatedBy` so we can offer a return banner.
    Credentials({
      id: "impersonate",
      name: "Admin impersonation",
      credentials: {
        nonce: { label: "Nonce", type: "text" },
      },
      async authorize(credentials) {
        const nonce =
          typeof credentials?.nonce === "string" ? credentials.nonce : null;
        if (!nonce) return null;

        try {
          const { payload } = await jwtVerify(nonce, getSecret(), {
            audience: "kb:impersonate",
          });
          const adminId =
            typeof payload.adminId === "string" ? payload.adminId : null;
          const targetUserId =
            typeof payload.targetUserId === "string"
              ? payload.targetUserId
              : null;
          if (!adminId || !targetUserId) return null;

          const [admin, target] = await Promise.all([
            prisma.user.findUnique({ where: { id: adminId } }),
            prisma.user.findUnique({ where: { id: targetUserId } }),
          ]);
          if (!admin || admin.role !== "ADMIN") return null;
          if (!target) return null;

          return {
            id: target.id,
            email: target.email,
            name: target.name,
            role: target.role,
            // null when an admin signs back into their own account
            impersonatedBy: target.id === admin.id ? null : admin.id,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
