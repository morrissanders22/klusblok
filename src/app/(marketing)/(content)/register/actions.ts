"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { generateVerifyToken, verifyUrl } from "@/lib/verify";
import { sendNotification } from "@/lib/notifications";

const consumerSchema = z.object({
  name: z.string().min(2, "Naam moet minstens 2 tekens zijn"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().min(8, "Vul een geldig telefoonnummer in"),
  password: z.string().min(8, "Wachtwoord moet minstens 8 tekens zijn"),
});

const contractorSchema = z.object({
  name: z.string().min(2, "Naam moet minstens 2 tekens zijn"),
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht"),
  kvkNumber: z
    .string()
    .regex(/^\d{8}$/, "KVK-nummer moet 8 cijfers zijn"),
  email: z.string().email("Ongeldig e-mailadres"),
  phone: z.string().min(8, "Vul een geldig telefoonnummer in"),
  password: z.string().min(8, "Wachtwoord moet minstens 8 tekens zijn"),
});

export type RegisterState = { error?: string } | undefined;

async function sendVerifyMail(email: string, name: string, token: string) {
  await sendNotification({
    to: email,
    subject: "Bevestig je Klusblok-account",
    body: `Hoi ${name},

Klik op onderstaande link om je e-mailadres te bevestigen:

${verifyUrl(token)}

Tot zo!
Klusblok`,
  });
}

export async function registerConsumer(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = consumerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) return { error: "Dit e-mailadres is al geregistreerd" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const verifyToken = generateVerifyToken();

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      role: "CONSUMER",
      verifyToken,
    },
  });

  await sendVerifyMail(parsed.data.email, parsed.data.name, verifyToken);

  redirect(
    `/verify/check?email=${encodeURIComponent(parsed.data.email)}&role=kluszoeker`,
  );
}

export async function registerContractor(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = contractorSchema.safeParse({
    name: formData.get("name"),
    companyName: formData.get("companyName"),
    kvkNumber: formData.get("kvkNumber"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const [existingEmail, existingKvk] = await Promise.all([
    prisma.user.findUnique({ where: { email: parsed.data.email } }),
    prisma.user.findUnique({ where: { kvkNumber: parsed.data.kvkNumber } }),
  ]);
  if (existingEmail) return { error: "Dit e-mailadres is al geregistreerd" };
  if (existingKvk) return { error: "Dit KVK-nummer is al geregistreerd" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const verifyToken = generateVerifyToken();

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      companyName: parsed.data.companyName,
      kvkNumber: parsed.data.kvkNumber,
      hasLiabilityInsurance: false,
      passwordHash,
      role: "CONTRACTOR",
      verifyToken,
    },
  });

  await sendVerifyMail(parsed.data.email, parsed.data.name, verifyToken);

  redirect(
    `/verify/check?email=${encodeURIComponent(parsed.data.email)}&role=klusser`,
  );
}
