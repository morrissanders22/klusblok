"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { SERVICES } from "@/lib/services";

export type SettingsState =
  | { error?: string; success?: string }
  | undefined;

const profileFotoSchema = z.object({
  bio: z.string().max(800, "Maximaal 800 tekens").optional(),
  photoUrl: z.string().optional(),
  specialties: z.array(z.enum(SERVICES)).max(5).optional(),
});

export async function updateKlusserProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) return { error: "Niet ingelogd" };

  const parsed = profileFotoSchema.safeParse({
    bio: formData.get("bio") || undefined,
    photoUrl: formData.get("photoUrl") || undefined,
    specialties: (formData.getAll("specialties") as string[]).filter(Boolean),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: parsed.data.bio ?? null,
      photoUrl: parsed.data.photoUrl ?? null,
      specialties: parsed.data.specialties ?? [],
    },
  });

  revalidatePath("/instellingen");
  return { success: "Klusser-profiel bijgewerkt" };
}

const profileSchema = z.object({
  name: z.string().min(2, "Naam moet minstens 2 tekens zijn"),
  phone: z.string().min(8, "Vul een geldig telefoonnummer in"),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  serviceRadiusKm: z.coerce.number().int().min(0).max(500).optional(),
});

export async function updateProfile(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) return { error: "Niet ingelogd" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    city: formData.get("city") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    address: formData.get("address") || undefined,
    serviceRadiusKm: formData.get("serviceRadiusKm") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    city: parsed.data.city,
    postalCode: parsed.data.postalCode,
    address: parsed.data.address,
  };
  if (parsed.data.serviceRadiusKm !== undefined) {
    data.serviceRadiusKm = parsed.data.serviceRadiusKm;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  revalidatePath("/instellingen");
  revalidatePath("/", "layout");
  return { success: "Profiel bijgewerkt" };
}

const businessSchema = z.object({
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht"),
  kvkNumber: z.string().regex(/^\d{8}$/, "KVK-nummer moet 8 cijfers zijn"),
  hasLiabilityInsurance: z.literal("on", {
    errorMap: () => ({
      message: "Bevestig dat je een rechtsbijstandsverzekering hebt",
    }),
  }),
});

export async function updateBusiness(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) return { error: "Niet ingelogd" };

  const parsed = businessSchema.safeParse({
    companyName: formData.get("companyName"),
    kvkNumber: formData.get("kvkNumber"),
    hasLiabilityInsurance: formData.get("hasLiabilityInsurance"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const existing = await prisma.user.findUnique({
    where: { kvkNumber: parsed.data.kvkNumber },
  });
  if (existing && existing.id !== session.user.id) {
    return { error: "Dit KVK-nummer is al in gebruik" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      companyName: parsed.data.companyName,
      kvkNumber: parsed.data.kvkNumber,
      hasLiabilityInsurance: true,
      insuranceConfirmedAt: new Date(),
    },
  });

  revalidatePath("/instellingen");
  revalidatePath("/", "layout");
  return { success: "Bedrijfsgegevens bijgewerkt" };
}

const passwordSchema = z.object({
  current: z.string().min(1, "Huidig wachtwoord is verplicht"),
  next: z.string().min(8, "Nieuw wachtwoord moet minstens 8 tekens zijn"),
});

export async function changePassword(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await auth();
  if (!session?.user) return { error: "Niet ingelogd" };

  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) return { error: "Gebruiker niet gevonden" };

  const ok = await bcrypt.compare(parsed.data.current, user.passwordHash);
  if (!ok) return { error: "Huidig wachtwoord klopt niet" };

  const passwordHash = await bcrypt.hash(parsed.data.next, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  return { success: "Wachtwoord gewijzigd" };
}
