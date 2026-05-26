"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

const schema = z.object({
  klusserId: z.string().min(1),
  subject: z.string().min(3, "Onderwerp moet minstens 3 tekens zijn"),
  message: z.string().min(20, "Bericht moet minstens 20 tekens zijn"),
});

export type ContactState =
  | { error?: string; success?: string }
  | undefined;

export async function contactKlusser(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Log in om een verzoek te sturen." };
  }

  const parsed = schema.safeParse({
    klusserId: formData.get("klusserId"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const [klusser, sender] = await Promise.all([
    prisma.user.findUnique({
      where: { id: parsed.data.klusserId },
      select: { email: true, name: true, companyName: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    }),
  ]);
  if (!klusser) return { error: "Klusser niet gevonden" };
  if (!sender) return { error: "Account-probleem" };

  await sendNotification({
    to: klusser.email,
    subject: `Klusverzoek via Klusblok: ${parsed.data.subject}`,
    body: `Hoi ${klusser.name},

${sender.name} heeft een klusverzoek voor je via Klusblok:

Onderwerp: ${parsed.data.subject}

${parsed.data.message}

Reageer rechtstreeks via:
- E-mail: ${sender.email}
${sender.phone ? `- Telefoon: ${sender.phone}` : ""}

Klusblok`,
  });

  return {
    success: `Verzoek verzonden naar ${klusser.companyName ?? klusser.name}.`,
  };
}
