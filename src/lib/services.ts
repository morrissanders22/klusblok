import { JobTier } from "@prisma/client";

export const SERVICES = [
  "Stucwerk",
  "Loodgieterswerk",
  "Elektriciteit",
  "Timmerwerk",
  "Schilderwerk",
  "Tegelwerk",
  "Dakwerk",
  "Metselwerk",
  "Tuinwerk",
  "Schoonmaak",
  "Verhuizing",
  "Klein onderhoud",
  "Anders",
] as const;

export const SERVICE_EMOJI: Record<string, string> = {
  Stucwerk: "🧱",
  Loodgieterswerk: "🚿",
  Elektriciteit: "⚡",
  Timmerwerk: "🔨",
  Schilderwerk: "🎨",
  Tegelwerk: "🧱",
  Dakwerk: "🏠",
  Metselwerk: "🧱",
  Tuinwerk: "🌳",
  Schoonmaak: "🧽",
  Verhuizing: "📦",
  "Klein onderhoud": "🔧",
  Anders: "✨",
};

export type Service = (typeof SERVICES)[number];

export type Complexity = "small" | "standard" | "large";

export const COMPLEXITY_LABELS: Record<Complexity, string> = {
  small: "Kleine klus",
  standard: "Standaard klus",
  large: "Grote klus",
};

export const COMPLEXITY_DESCRIPTIONS: Record<Complexity, string> = {
  small: "Snel klusje, bijv. een kraan vervangen of een klein reparatietje.",
  standard: "Normale klus, ongeveer een halve tot hele dag werk.",
  large: "Grotere klus met meer materiaal of meerdere dagen werk.",
};

export const TIER_PRICE_CENTS: Record<JobTier, number> = {
  TIER_1: 600,
  TIER_2: 1000,
  TIER_3: 2000,
  TIER_4: 4000,
};

export const TIER_LABELS: Record<JobTier, string> = {
  TIER_1: "Klein klusje",
  TIER_2: "Standaard klus",
  TIER_3: "Grote klus",
  TIER_4: "Project (3+ diensten)",
};

export function computeTier(
  serviceCount: number,
  complexity: Complexity,
): JobTier {
  if (serviceCount >= 3) return "TIER_4";
  if (complexity === "small") return "TIER_1";
  if (complexity === "standard") return "TIER_2";
  return "TIER_3";
}

export function formatEuro(cents: number): string {
  const euros = cents / 100;
  return `€ ${euros.toLocaleString("nl-NL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export const CLAIM_WINDOW_MINUTES = 120;
