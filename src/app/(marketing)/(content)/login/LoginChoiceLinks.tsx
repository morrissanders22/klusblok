"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home, Hammer, ArrowRight } from "lucide-react";

export function LoginChoiceLinks() {
  const params = useSearchParams();
  const next = params.get("next");
  const qs = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ChoiceCard
        Icon={Home}
        title="Klusplaatser"
        description="Ik heb een klus die ik wil plaatsen of beheren."
        href={`/login/kluszoeker${qs}`}
      />
      <ChoiceCard
        Icon={Hammer}
        title="Kluszoeker"
        description="Ik ben vakman en wil reageren op open klussen."
        href={`/login/klusser${qs}`}
      />
    </div>
  );
}

function ChoiceCard({
  Icon,
  title,
  description,
  href,
}: {
  Icon: typeof Home;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="kb-card p-6 block group">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "#f7c021", color: "#1a2535" }}
      >
        <Icon size={22} />
      </div>
      <h2 className="kb-heading text-2xl mb-2">{title}</h2>
      <p className="text-sm text-[#5c6878] mb-4">{description}</p>
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3586b6] group-hover:text-[#1e4f70]">
        Inloggen <ArrowRight size={14} />
      </span>
    </Link>
  );
}
