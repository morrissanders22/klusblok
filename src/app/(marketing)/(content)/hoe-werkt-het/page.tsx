import Link from "next/link";
import { Home, Hammer, ArrowRight } from "lucide-react";

export const metadata = { title: "Hoe werkt Klusblok — Klusblok" };

export default function HoeWerktHetPage() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-12">
      <header className="text-center">
        <p className="kb-eyebrow">Eenvoudig & transparant</p>
        <h1 className="kb-heading text-4xl sm:text-5xl mt-2">
          Hoe werkt Klusblok?
        </h1>
        <p className="text-[#5c6878] mt-3 max-w-xl mx-auto">
          Particulieren plaatsen gratis. Aannemers betalen alleen voor klussen
          die ze daadwerkelijk claimen — geen abonnementen, geen verrassingen.
        </p>
      </header>

      <section id="klus" className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Home size={18} className="text-[#3586b6]" />
          <h2 className="kb-heading text-2xl">Voor particulieren</h2>
        </div>
        <ol className="space-y-3">
          <Step n={1} title="Plaats gratis je klus">
            Maak een account aan, beschrijf je klus, voeg tot 4 foto&apos;s toe en
            laat je adres en telefoonnummer achter. Plaatsen is altijd gratis.
          </Step>
          <Step n={2} title="Aannemer claimt en betaalt">
            Een aannemer met passende ervaring claimt je klus en betaalt
            eenmalig (€ 6 – € 40). Pas dan ziet hij/zij je contactgegevens.
          </Step>
          <Step n={3} title="Direct contact binnen 2 uur">
            De aannemer neemt binnen 2 uur contact met je op. Lukt dat niet,
            dan komt de klus automatisch weer beschikbaar voor anderen.
          </Step>
          <Step n={4} title="Bevestig & beoordeel">
            Is de klus aangenomen? Bevestig dat allebei in het portaal, en
            laat een review achter voor de aannemer.
          </Step>
        </ol>
      </section>

      <section id="klusser" className="space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Hammer size={18} className="text-[#3586b6]" />
          <h2 className="kb-heading text-2xl">Voor aannemers</h2>
        </div>
        <ol className="space-y-3">
          <Step n={1} title="Gratis account, geen abonnement">
            Registreer met je KVK-nummer en bevestig je
            rechtsbijstandsverzekering. Geen abonnement, geen verborgen
            kosten.
          </Step>
          <Step n={2} title="Bekijk klussen in je regio">
            Zie alle open klussen met omschrijving, foto&apos;s, plaats en prijs.
            Adres en telefoon krijg je pas na claim.
          </Step>
          <Step n={3} title="Claim en betaal eenmalig">
            Klus geclaimd? Betaal eenmalig via iDEAL of creditcard. Daarna zie
            je direct alle contactgegevens.
          </Step>
          <Step n={4} title="2-uur venster om contact op te nemen">
            Bel binnen 2 uur de klant. Zo voorkomen we dat leads blijven
            liggen of dat klanten lang moeten wachten.
          </Step>
        </ol>
      </section>

      <section
        className="rounded-2xl p-10 text-center"
        style={{
          background: "linear-gradient(135deg, #1e4f70 0%, #3586b6 100%)",
          color: "white",
        }}
      >
        <p
          className="kb-eyebrow"
          style={{ color: "#f6b42c", opacity: 1 }}
        >
          Klaar om te beginnen?
        </p>
        <h2
          className="kb-heading text-3xl mt-2"
          style={{ color: "white" }}
        >
          Start gratis vandaag
        </h2>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <Link href="/register/consumer" className="btn-yellow">
            Plaats een klus <ArrowRight size={14} />
          </Link>
          <Link href="/register/contractor" className="btn-outline">
            Word aannemer
          </Link>
        </div>
      </section>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="kb-panel !p-5 flex gap-4">
      <div
        className="rounded-full w-10 h-10 font-bold flex-shrink-0 flex items-center justify-center"
        style={{
          backgroundColor: "#f6b42c",
          color: "#1a2535",
          fontFamily: "var(--font-heading-barlow)",
        }}
      >
        {n}
      </div>
      <div>
        <p className="font-bold text-[#1a2535]">{title}</p>
        <p className="text-sm text-[#5c6878] mt-1 leading-relaxed">
          {children}
        </p>
      </div>
    </li>
  );
}
