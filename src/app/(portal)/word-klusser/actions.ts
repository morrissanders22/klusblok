"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { MODE_COOKIE } from "@/lib/mode";

const schema = z.object({
  companyName: z.string().min(2, "Bedrijfsnaam is verplicht"),
  kvkNumber: z.string().regex(/^\d{8}$/, "KVK-nummer moet 8 cijfers zijn"),
  phone: z.string().min(8, "Vul een geldig telefoonnummer in"),
  hasLiabilityInsurance: z.literal("on", {
    errorMap: () => ({
      message: "Bevestig dat je een rechtsbijstandsverzekering hebt",
    }),
  }),
  next: z.string().optional(),
});

export type UpgradeState = { error?: string } | undefined;

export async function becomeContractor(
  _prev: UpgradeState,
  formData: FormData,
): Promise<UpgradeState> {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/word-klusser");

  const parsed = schema.safeParse({
    companyName: formData.get("companyName"),
    kvkNumber: formData.get("kvkNumber"),
    phone: formData.get("phone"),
    hasLiabilityInsurance: formData.get("hasLiabilityInsurance"),
    next: formData.get("next"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const existing = await prisma.user.findUnique({
    where: { kvkNumber: parsed.data.kvkNumber },
  });
  if (existing && existing.id !== session.user.id) {
    return { error: "Dit KVK-nummer is al geregistreerd door een andere gebruiker" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      companyName: parsed.data.companyName,
      kvkNumber: parsed.data.kvkNumber,
      hasLiabilityInsurance: true,
      phone: parsed.data.phone,
    },
  });

  const store = await cookies();
  store.set(MODE_COOKIE, "klusser", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");

  // If user came from a job page, redirect back with ?claim=open so the
  // ClaimModal opens automatically — no extra click needed.
  const next = parsed.data.next;
  if (next && next.startsWith("/jobs/")) {
    const sep = next.includes("?") ? "&" : "?";
    redirect(`${next}${sep}claim=open`);
  }
  redirect(next ?? "/dashboard");
}

const consumerUpgradeSchema = z.object({
  phone: z.string().min(8, "Vul een geldig telefoonnummer in"),
});

export async function becomeConsumer(
  _prev: UpgradeState,
  formData: FormData,
): Promise<UpgradeState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = consumerUpgradeSchema.safeParse({
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { phone: parsed.data.phone },
  });

  const store = await cookies();
  store.set(MODE_COOKIE, "kluszoeker", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
