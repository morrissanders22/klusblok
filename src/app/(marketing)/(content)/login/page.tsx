import Link from "next/link";
import { Suspense } from "react";
import { Home, Hammer, ArrowRight } from "lucide-react";

import { LoginChoiceLinks } from "./LoginChoiceLinks";

export default function LoginPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="text-center mb-10">
        <p className="kb-eyebrow">Welkom terug</p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Hoe wil je inloggen?
        </h1>
        <p className="text-[#5c6878] mt-2">
          Kies de modus waarin je vandaag wilt werken. Je kunt later eenvoudig
          switchen in de software.
        </p>
      </header>

      <Suspense fallback={<div className="grid md:grid-cols-2 gap-4">
        <ChoiceCardStatic
          Icon={Home}
          title="Kluszoeker"
          description="Ik heb een klus die ik wil plaatsen of beheren."
          href="/login/kluszoeker"
        />
        <ChoiceCardStatic
          Icon={Hammer}
          title="Klusser"
          description="Ik ben aannemer en wil reageren op open klussen."
          href="/login/klusser"
        />
      </div>}>
        <LoginChoiceLinks />
      </Suspense>

      <p className="mt-8 text-sm text-[#5c6878] text-center">
        Nog geen account?{" "}
        <Link
          href="/register"
          className="text-[#3586b6] font-bold hover:underline"
        >
          Registreer hier
        </Link>
      </p>
    </div>
  );
}

function ChoiceCardStatic({
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
        style={{ backgroundColor: "#f6b42c", color: "#1a2535" }}
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
