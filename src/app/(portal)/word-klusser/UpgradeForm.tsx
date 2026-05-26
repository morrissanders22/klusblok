"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { becomeContractor, type UpgradeState } from "./actions";

export function UpgradeForm({
  defaults,
  nextHref,
}: {
  defaults: { companyName: string; phone: string };
  nextHref?: string;
}) {
  const [state, action, pending] = useActionState<UpgradeState, FormData>(
    becomeContractor,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      {nextHref && <input type="hidden" name="next" value={nextHref} />}
      <div>
        <label className="kb-field-label">Bedrijfsnaam</label>
        <input
          name="companyName"
          required
          defaultValue={defaults.companyName}
          className="kb-input"
        />
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
      <div>
        <label className="kb-field-label">Telefoonnummer (zakelijk)</label>
        <input
          type="tel"
          name="phone"
          required
          defaultValue={defaults.phone}
          className="kb-input"
        />
      </div>
      <label
        className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-[#f7f9fc]"
        style={{ borderColor: "#dde4ed" }}
      >
        <input
          type="checkbox"
          name="hasLiabilityInsurance"
          required
          className="mt-0.5"
        />
        <div className="flex-1 text-sm">
          <span className="font-semibold text-[#1a2535] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#10b981]" />
            Rechtsbijstandsverzekering
          </span>
          <span className="text-[#5c6878] text-xs block mt-1">
            Ik bevestig dat mijn bedrijf een geldige aansprakelijkheids-/
            rechtsbijstandsverzekering heeft.
          </span>
        </div>
      </label>
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
        {pending ? "Bezig…" : "Activeer klusser-modus"}
      </button>
    </form>
  );
}
