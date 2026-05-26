"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { computeTier, SERVICES } from "@/lib/services";
import { getAllPrices } from "@/lib/pricing";

const schema = z.object({
  type: z.enum(["single", "project"]),
  title: z.string().min(3, "Titel moet minstens 3 tekens zijn"),
  description: z.string().min(20, "Beschrijving moet minstens 20 tekens zijn"),
  services: z
    .array(z.enum(SERVICES))
    .min(1, "Kies minstens één dienst")
    .max(10),
  complexity: z.enum(["small", "standard", "large"]),
  city: z.string().min(2, "Plaats is verplicht"),
  address: z.string().min(3, "Adres is verplicht"),
  postalCode: z.string().min(4, "Postcode is verplicht"),
  phone: z.string().min(8, "Vul een geldig telefoonnummer in"),
  photos: z
    .array(z.string().url().or(z.string().startsWith("/")))
    .min(2, "Voeg minimaal 2 foto's toe")
    .max(4),
});

export type NewJobState = { error?: string } | undefined;

export async function createJob(
  _prev: NewJobState,
  formData: FormData,
): Promise<NewJobState> {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/jobs/new");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });
  if (!me?.emailVerified) {
    return { error: "Bevestig eerst je e-mailadres om een klus te kunnen plaatsen." };
  }

  const parsed = schema.safeParse({
    type: formData.get("type") ?? "single",
    title: formData.get("title"),
    description: formData.get("description"),
    services: formData.getAll("services"),
    complexity: formData.get("complexity") ?? "standard",
    city: formData.get("city"),
    address: formData.get("address"),
    postalCode: formData.get("postalCode"),
    phone: formData.get("phone"),
    photos: formData.getAll("photos").filter(Boolean),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const prices = await getAllPrices();

  let tier: ReturnType<typeof computeTier>;
  let priceCents: number;
  if (parsed.data.type === "project") {
    tier = "TIER_4";
    priceCents = prices.PROJECT;
  } else {
    tier = computeTier(parsed.data.services.length, parsed.data.complexity);
    priceCents = prices[tier];
  }

  const job = await prisma.job.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      city: parsed.data.city,
      address: parsed.data.address,
      postalCode: parsed.data.postalCode,
      phone: parsed.data.phone,
      tier,
      priceCents,
      type: parsed.data.type === "project" ? "PROJECT" : "SINGLE",
      consumerId: session.user.id,
      services: {
        create: parsed.data.services.map((service) => ({ service })),
      },
      photos: {
        create: parsed.data.photos.map((url, i) => ({ url, order: i })),
      },
    },
  });

  redirect(`/jobs/${job.id}`);
}
