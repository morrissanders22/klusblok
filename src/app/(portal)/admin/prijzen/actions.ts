"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { setAllPrices } from "@/lib/pricing";

const schema = z.object({
  tier1: z.coerce.number().int().min(1, "Minimaal 1 cent"),
  tier2: z.coerce.number().int().min(1),
  tier3: z.coerce.number().int().min(1),
  tier4: z.coerce.number().int().min(1),
  project: z.coerce.number().int().min(1),
});

export type PricingState =
  | { error?: string; success?: string }
  | undefined;

function eurosToCents(v: number): number {
  return Math.round(v * 100);
}

export async function savePricing(
  _prev: PricingState,
  formData: FormData,
): Promise<PricingState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Niet toegestaan" };

  const parsed = schema.safeParse({
    tier1: formData.get("tier1"),
    tier2: formData.get("tier2"),
    tier3: formData.get("tier3"),
    tier4: formData.get("tier4"),
    project: formData.get("project"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  await setAllPrices({
    TIER_1: eurosToCents(parsed.data.tier1),
    TIER_2: eurosToCents(parsed.data.tier2),
    TIER_3: eurosToCents(parsed.data.tier3),
    TIER_4: eurosToCents(parsed.data.tier4),
    PROJECT: eurosToCents(parsed.data.project),
  });

  revalidatePath("/admin/prijzen");
  return { success: "Prijzen bijgewerkt" };
}
