"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { registerConsumer, type RegisterState } from "../actions";

export default function ConsumerRegisterPage() {
  const [state, action, pending] = useActionState<RegisterState, FormData>(
    registerConsumer,
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
        <p className="kb-eyebrow">Particulier</p>
        <h1 className="kb-heading text-3xl mt-2">Maak je account aan</h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Plaats gratis je klus en ontvang reacties van vakmensen.
        </p>
      </header>
      <div className="kb-panel">
        <form action={action} className="space-y-4">
          <div>
            <label className="kb-field-label">Naam</label>
            <input
              name="name"
              required
              placeholder="Voor- en achternaam"
              className="kb-input"
            />
          </div>
          <div>
            <label className="kb-field-label">E-mail</label>
            <input
              type="email"
              name="email"
              required
              placeholder="naam@voorbeeld.nl"
              className="kb-input"
            />
          </div>
          <div>
            <label className="kb-field-label">Telefoonnummer</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="06 12345678"
              className="kb-input"
            />
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
            {pending ? "Account aanmaken…" : "Account aanmaken"}
          </button>
        </form>
      </div>
    </div>
  );
}
