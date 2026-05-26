import { JobTier } from "@prisma/client";
import { prisma } from "@/lib/db";

export type TierPrices = Record<JobTier, number>;

export type AllPrices = TierPrices & { PROJECT: number };

const DEFAULT_PRICES: AllPrices = {
  TIER_1: 600,
  TIER_2: 1000,
  TIER_3: 2000,
  TIER_4: 4000,
  PROJECT: 5000,
};

const KEY_BY_TIER: Record<JobTier, string> = {
  TIER_1: "pricing.tier1.cents",
  TIER_2: "pricing.tier2.cents",
  TIER_3: "pricing.tier3.cents",
  TIER_4: "pricing.tier4.cents",
};

const PROJECT_KEY = "pricing.project.cents";

export async function getAllPrices(): Promise<AllPrices> {
  const keys = [...Object.values(KEY_BY_TIER), PROJECT_KEY];
  const settings = await prisma.platformSetting
    .findMany({ where: { key: { in: keys } } })
    .catch(() => []);
  const byKey = new Map(settings.map((s) => [s.key, s.value]));
  const prices = { ...DEFAULT_PRICES };
  for (const tier of Object.keys(KEY_BY_TIER) as JobTier[]) {
    const raw = byKey.get(KEY_BY_TIER[tier]);
    if (raw) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n > 0) prices[tier] = n;
    }
  }
  const projRaw = byKey.get(PROJECT_KEY);
  if (projRaw) {
    const n = parseInt(projRaw, 10);
    if (!isNaN(n) && n > 0) prices.PROJECT = n;
  }
  return prices;
}

export async function getTierPrices(): Promise<TierPrices> {
  const all = await getAllPrices();
  return {
    TIER_1: all.TIER_1,
    TIER_2: all.TIER_2,
    TIER_3: all.TIER_3,
    TIER_4: all.TIER_4,
  };
}

export async function setAllPrices(prices: AllPrices): Promise<void> {
  await prisma.$transaction([
    ...(Object.keys(KEY_BY_TIER) as JobTier[]).map((tier) =>
      prisma.platformSetting.upsert({
        where: { key: KEY_BY_TIER[tier] },
        create: { key: KEY_BY_TIER[tier], value: String(prices[tier]) },
        update: { value: String(prices[tier]) },
      }),
    ),
    prisma.platformSetting.upsert({
      where: { key: PROJECT_KEY },
      create: { key: PROJECT_KEY, value: String(prices.PROJECT) },
      update: { value: String(prices.PROJECT) },
    }),
  ]);
}

export async function setTierPrices(prices: TierPrices): Promise<void> {
  const all = await getAllPrices();
  await setAllPrices({ ...all, ...prices });
}
