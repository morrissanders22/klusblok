"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Reveal } from "@/components/Reveal";

const FAQS = [
  {
    q: "Wat kost het om een klus te plaatsen?",
    a: "Helemaal niets. Als particulier plaats je gratis een klus op Klusblok. Je betaalt nooit voor het ontvangen van reacties.",
  },
  {
    q: "Wat betaalt een klusser per klus?",
    a: "Tussen de € 6 en € 40, afhankelijk van de grootte. Een kleine reparatie kost € 6, een standaard klus € 10 of € 20, en een project (3 of meer diensten gecombineerd) € 40. Geen abonnement, geen verborgen kosten.",
  },
  {
    q: "Hoe weet ik dat een klusser betrouwbaar is?",
    a: "Elke klusser registreert zich met KVK-nummer en bevestigt een rechtsbijstandsverzekering. Na de klus laat jij een review achter die voor andere particulieren zichtbaar wordt.",
  },
  {
    q: "Wat is dat venster van 2 uur?",
    a: "Zodra een klusser jouw klus claimt heeft hij/zij 2 uur om contact met je op te nemen. Lukt dat niet, dan komt de klus automatisch weer beschikbaar voor andere vakmensen.",
  },
  {
    q: "Hoe plaats ik mijn klus?",
    a: "Maak een gratis account aan, beschrijf je klus, voeg tot 4 foto's toe en laat je adres + telefoonnummer achter. Klussers in jouw regio krijgen je opdracht direct te zien.",
  },
];

export function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-2.5">
      {FAQS.map((faq, i) => (
        <Reveal key={faq.q} delay={i * 60}>
          <div
            style={{ border: "1px solid #dde4ed", borderRadius: "8px" }}
            className="overflow-hidden transition-colors hover:border-[#3586b6]/55"
          >
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full bg-transparent border-0 p-[22px_24px] flex justify-between items-center cursor-pointer text-left gap-4"
            >
              <span className="text-[15px] font-bold text-[#1a2535]">
                {faq.q}
              </span>
              <ChevronDown
                size={18}
                color="#3586b6"
                className="flex-shrink-0 transition-transform"
                style={{
                  transform: openFaq === i ? "rotate(180deg)" : "none",
                }}
              />
            </button>
            {openFaq === i && (
              <div
                style={{ borderTop: "1px solid #f1f5f9" }}
                className="px-6 pb-[22px]"
              >
                <p className="pt-3.5 text-sm text-[#5c6878] leading-[1.85]">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
