import Link from "next/link";
import { Suspense } from "react";
import { Home, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { LoginForm } from "../LoginForm";

export const metadata: Metadata = {
  title: "Inloggen als klusplaatser",
  description:
    "Log in als klusplaatser en beheer je geplaatste klussen of plaats een nieuwe klus.",
  alternates: { canonical: "/login/kluszoeker" },
  robots: { index: false, follow: true },
};

export default function KluszoekerLoginPage() {
  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-[#5c6878] hover:text-[#3586b6] mb-4"
      >
        <ArrowLeft size={14} /> Andere modus
      </Link>
      <header className="mb-6">
        <p className="kb-eyebrow flex items-center gap-2">
          <Home size={12} /> Klusplaatser
        </p>
        <h1 className="kb-heading text-3xl mt-2">
          Inloggen als klusplaatser
        </h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Na inloggen kun je je klussen beheren of een nieuwe plaatsen.
        </p>
      </header>
      <div className="kb-panel">
        <Suspense fallback={<p className="text-neutral-500">Laden…</p>}>
          <LoginForm mode="kluszoeker" registerHref="/register/consumer" />
        </Suspense>
      </div>
    </div>
  );
}
