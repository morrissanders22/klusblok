import Link from "next/link";
import { Suspense } from "react";
import { Hammer, ArrowLeft } from "lucide-react";
import { LoginForm } from "../LoginForm";

export default function KlusserLoginPage() {
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
          <Hammer size={12} /> Klusser
        </p>
        <h1 className="kb-heading text-3xl mt-2">Inloggen als klusser</h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Na inloggen kom je direct in klusser-modus en kun je reageren op
          open klussen.
        </p>
      </header>
      <div className="kb-panel">
        <Suspense fallback={<p className="text-neutral-500">Laden…</p>}>
          <LoginForm mode="klusser" registerHref="/register/contractor" />
        </Suspense>
      </div>
    </div>
  );
}
