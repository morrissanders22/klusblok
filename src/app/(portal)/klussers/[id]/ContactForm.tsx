"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { contactKlusser, type ContactState } from "./actions";

export function ContactForm({
  klusserId,
  klusserName,
}: {
  klusserId: string;
  klusserName: string;
}) {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    contactKlusser,
    undefined,
  );

  if (state?.success) {
    return (
      <div
        className="rounded-xl border p-5 text-center"
        style={{ backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }}
      >
        <p className="font-bold text-[#065f46] mb-1">✓ Verzoek verzonden</p>
        <p className="text-sm text-[#047857]">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="klusserId" value={klusserId} />
      <div>
        <label className="kb-field-label">Onderwerp</label>
        <input
          name="subject"
          required
          minLength={3}
          placeholder={`Klusverzoek voor ${klusserName}`}
          className="kb-input"
        />
      </div>
      <div>
        <label className="kb-field-label">Bericht</label>
        <textarea
          name="message"
          required
          rows={5}
          minLength={20}
          placeholder="Beschrijf wat je gedaan wilt hebben, locatie en wanneer het zou moeten gebeuren."
          className="kb-textarea"
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
        <Mail size={16} /> {pending ? "Versturen…" : "Verstuur verzoek"}
      </button>
      <p className="text-xs text-[#5c6878] text-center">
        Je e-mail en telefoonnummer worden gedeeld met de klusser.
      </p>
    </form>
  );
}
