import Link from "next/link";
import { Home, Hammer, ArrowRight, Check } from "lucide-react";

export default function RegisterChoicePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="text-center mb-10">
        <p className="kb-eyebrow">Account aanmaken</p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Welk type account?
        </h1>
        <p className="text-[#5c6878] mt-2">
          Maak gratis een account aan als particulier om een klus te plaatsen,
          of als aannemer om klussen te claimen.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <RoleCard
          href="/register/consumer"
          Icon={Home}
          title="Klusplaatser"
          description="Plaats gratis je klus en ontvang reacties van vakmensen."
          bullets={[
            "100% gratis",
            "Reacties binnen 2 uur",
            "Direct contact met de kluszoeker",
          ]}
        />
        <RoleCard
          href="/register/contractor"
          Icon={Hammer}
          title="Kluszoeker"
          description="Vind klussen bij jou in de buurt. Betaal alleen per claim."
          bullets={[
            "Geen abonnement",
            "Vanaf € 6 per klus",
            "KVK-geverifieerd platform",
          ]}
        />
      </div>

      <p className="mt-8 text-sm text-[#5c6878] text-center">
        Al een account?{" "}
        <Link
          href="/login"
          className="text-[#3586b6] font-bold hover:underline"
        >
          Log hier in
        </Link>
      </p>
    </div>
  );
}

function RoleCard({
  href,
  Icon,
  title,
  description,
  bullets,
}: {
  href: string;
  Icon: typeof Home;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <Link
      href={href}
      className="kb-card p-6 group"
      style={{ display: "block" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "#f7c021", color: "#1a2535" }}
      >
        <Icon size={22} />
      </div>
      <h2 className="kb-heading text-2xl mb-2">{title}</h2>
      <p className="text-sm text-[#5c6878] mb-4">{description}</p>
      <ul className="space-y-2 mb-5">
        {bullets.map((b) => (
          <li
            key={b}
            className="flex items-center gap-2 text-sm text-[#1a2535]"
          >
            <Check size={14} className="text-[#10b981] flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3586b6] group-hover:text-[#1e4f70]">
        Account aanmaken <ArrowRight size={14} />
      </span>
    </Link>
  );
}
