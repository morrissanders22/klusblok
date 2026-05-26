"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session.user;
}

export type AdminUserState =
  | { error?: string; success?: string; createdId?: string }
  | undefined;

const createSchema = z.object({
  role: z.enum(["CONSUMER", "CONTRACTOR", "ADMIN"]),
  name: z.string().min(2, "Naam is verplicht"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().min(8, "Telefoonnummer is verplicht"),
  password: z.string().min(8, "Wachtwoord moet minstens 8 tekens zijn"),
  companyName: z.string().optional(),
  kvkNumber: z.string().optional(),
});

export async function adminCreateUser(
  _prev: AdminUserState,
  formData: FormData,
): Promise<AdminUserState> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    companyName: formData.get("companyName") || undefined,
    kvkNumber: formData.get("kvkNumber") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  if (parsed.data.role === "CONTRACTOR") {
    if (!parsed.data.companyName || !parsed.data.kvkNumber) {
      return {
        error: "Klussers vereisen een bedrijfsnaam en KVK-nummer.",
      };
    }
    if (!/^\d{8}$/.test(parsed.data.kvkNumber)) {
      return { error: "KVK-nummer moet 8 cijfers zijn." };
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) return { error: "Dit e-mailadres is al geregistreerd" };

  if (parsed.data.kvkNumber) {
    const existingKvk = await prisma.user.findUnique({
      where: { kvkNumber: parsed.data.kvkNumber },
    });
    if (existingKvk) return { error: "Dit KVK-nummer is al in gebruik" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: parsed.data.role,
      emailVerified: new Date(), // admin-created → already verified
      companyName: parsed.data.companyName ?? null,
      kvkNumber: parsed.data.kvkNumber ?? null,
      hasLiabilityInsurance: parsed.data.role === "CONTRACTOR",
      insuranceConfirmedAt:
        parsed.data.role === "CONTRACTOR" ? new Date() : null,
    },
  });

  revalidatePath("/admin", "layout");
  redirect(`/admin/klanten/${user.id}`);
}

export async function adminDeleteUser(userId: string): Promise<void> {
  const me = await requireAdmin();
  if (me.id === userId) {
    // protect against self-deletion
    return;
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

const updateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  role: z.enum(["CONSUMER", "CONTRACTOR", "ADMIN"]),
  city: z.string().optional(),
  companyName: z.string().optional(),
  kvkNumber: z.string().optional(),
  confirmInsurance: z.string().optional(),
});

export async function adminUpdateUser(
  userId: string,
  _prev: AdminUserState,
  formData: FormData,
): Promise<AdminUserState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    city: formData.get("city") || undefined,
    companyName: formData.get("companyName") || undefined,
    kvkNumber: formData.get("kvkNumber") || undefined,
    confirmInsurance: formData.get("confirmInsurance") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  if (parsed.data.kvkNumber && !/^\d{8}$/.test(parsed.data.kvkNumber)) {
    return { error: "KVK-nummer moet 8 cijfers zijn." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      role: parsed.data.role,
      city: parsed.data.city ?? null,
      companyName: parsed.data.companyName ?? null,
      kvkNumber: parsed.data.kvkNumber ?? null,
      ...(parsed.data.confirmInsurance === "on"
        ? {
            hasLiabilityInsurance: true,
            insuranceConfirmedAt: new Date(),
          }
        : {}),
    },
  });

  revalidatePath("/admin", "layout");
  return { success: "Gebruiker bijgewerkt" };
}

export async function adminVerifyUser(userId: string): Promise<void> {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date(), verifyToken: null },
  });
  revalidatePath(`/admin/klanten/${userId}`);
}
