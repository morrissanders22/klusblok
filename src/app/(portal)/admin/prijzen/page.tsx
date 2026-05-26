import { redirect } from "next/navigation";
import { Tag } from "lucide-react";

import { auth } from "@/auth";
import { getAllPrices } from "@/lib/pricing";
import { PricingForm } from "./PricingForm";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const prices = await getAllPrices();

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <p className="kb-eyebrow flex items-center gap-2">
          <Tag size={12} /> Prijzen
        </p>
        <h1 className="kb-heading text-3xl mt-2">Tariefconfiguratie</h1>
        <p className="text-[#5c6878] mt-2">
          Stel in wat een klusser betaalt om een klus te claimen. Nieuwe
          klussen krijgen deze prijzen toegewezen. Bestaande klussen behouden
          hun eerder vastgelegde prijs.
        </p>
      </header>

      <div className="kb-panel">
        <PricingForm
          defaults={{
            tier1: prices.TIER_1 / 100,
            tier2: prices.TIER_2 / 100,
            tier3: prices.TIER_3 / 100,
            tier4: prices.TIER_4 / 100,
            project: prices.PROJECT / 100,
          }}
        />
      </div>

      <section
        className="kb-panel !p-4 mt-4 text-sm"
        style={{ backgroundColor: "#eff6fc", borderColor: "#bfdbfe" }}
      >
        <p className="font-bold text-[#1e40af] mb-2">Hoe wordt de prijs bepaald?</p>
        <ul className="space-y-1.5 text-[#1a2535]">
          <li><strong>Type: Project</strong> = vaste project-prijs (Tier P)</li>
          <li><strong>Type: Losse klus &middot; klein</strong> = Tier 1</li>
          <li><strong>Type: Losse klus &middot; standaard</strong> = Tier 2</li>
          <li><strong>Type: Losse klus &middot; groot</strong> = Tier 3</li>
          <li><strong>Tier 4</strong> = legacy, niet meer toegewezen aan nieuwe klussen</li>
        </ul>
      </section>
    </div>
  );
}
