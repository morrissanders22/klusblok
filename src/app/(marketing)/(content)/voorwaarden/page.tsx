import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description:
    "Algemene voorwaarden van Klusblok. Lees de gebruiksvoorwaarden voor klusplaatsers en kluszoekers.",
  alternates: { canonical: "/voorwaarden" },
  robots: { index: true, follow: true },
};

export default function VoorwaardenPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <p className="kb-eyebrow">Juridisch</p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Algemene voorwaarden
        </h1>
      </header>
      <div className="kb-panel space-y-4 text-[#1a2535] leading-relaxed">
        <p>
          Klusblok faciliteert het contact tussen particulieren en aannemers.
          Wij zijn geen partij in de uiteindelijke overeenkomst tussen
          consument en aannemer en niet aansprakelijk voor de uitvoering van
          klussen.
        </p>
        <p className="text-[#5c6878] text-sm">
          De definitieve voorwaarden worden binnenkort opgesteld door de
          juridische partner van Klusblok.
        </p>
      </div>
    </div>
  );
}
