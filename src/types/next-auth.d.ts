import "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      impersonatedBy?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    impersonatedBy?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: Role;
    impersonatedBy?: string | null;
  }
}
