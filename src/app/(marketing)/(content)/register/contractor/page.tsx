"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { registerContractor, type RegisterState } from "../actions";

export default function ContractorRegisterPage() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerContractor,
    undefined,
  );

  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/register"
        className="inline-flex items-center gap-1 text-sm text-[#5c6878] hover:text-[#3586b6] mb-4"
      >
        <ArrowLeft size={14} /> Andere account-type
      </Link>
      <header className="mb-6">
        <p className="kb-eyebrow">Aannemer / klusser</p>
        <h1 className="kb-heading text-3xl mt-2">Maak een zakelijk account</h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Geen abonnement. Je betaalt alleen wanneer je een klus daadwerkelijk
          claimt.
        </p>
      </header>
      <div className="kb-panel">
        <form action={action} className="space-y-4">
          <div>
            <label className="kb-field-label">Bedrijfsnaam</label>
            <input name="companyName" required className="kb-input" />
          </div>
          <div>
            <label className="kb-field-label">Contactpersoon</label>
            <input name="name" required className="kb-input" />
          </div>
          <div>
            <label className="kb-field-label">KVK-nummer</label>
            <input
              name="kvkNumber"
              required
              inputMode="numeric"
              pattern="\d{8}"
              placeholder="12345678"
              className="kb-input"
            />
            <p className="text-xs text-[#5c6878] mt-1.5">
              Een geldige KVK-inschrijving is verplicht om klussen te claimen.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="kb-field-label">E-mail</label>
              <input
                type="email"
                name="email"
                required
                className="kb-input"
              />
            </div>
            <div>
              <label className="kb-field-label">Telefoon</label>
              <input
                type="tel"
                name="phone"
                required
                className="kb-input"
              />
            </div>
          </div>
          <div>
            <label className="kb-field-label">Wachtwoord</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="Minstens 8 tekens"
              className="kb-input"
            />
          </div>
          <div
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{
              backgroundColor: "#eff6fc",
              border: "1px solid #bfdbfe",
            }}
          >
            <ShieldCheck size={16} className="text-[#1e40af] flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <span className="font-semibold text-[#1e40af]">
                Eerste 30 dagen geen verzekering vereist
              </span>
              <span className="text-[#1e40af]/80 text-xs block mt-1">
                Start direct. Binnen 30 dagen voeg je je
                rechtsbijstandsverzekering toe via Instellingen.
              </span>
            </div>
          </div>
          {state?.error && (
            <div
              className="rounded-lg border p-3 text-sm"
              style={{
                backgroundColor: "#fef2f2",
                borderColor: "#fecaca",
                color: "#991b1b",
              }}
            >
              {state.error}
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="btn-yellow w-full justify-center"
          >
            {pending ? "Account aanmaken…" : "Zakelijk account aanmaken"}
          </button>
        </form>
      </div>
    </div>
  );
}
