import Link from "next/link";
import { Suspense } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { LoginForm } from "../LoginForm";

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
          <Home size={12} /> Kluszoeker
        </p>
        <h1 className="kb-heading text-3xl mt-2">Inloggen als kluszoeker</h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Na inloggen kom je direct in kluszoeker-modus en kun je je klussen
          beheren of een nieuwe plaatsen.
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
