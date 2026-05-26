"use client";

import { useActionState } from "react";
import { savePricing, type PricingState } from "./actions";

export function PricingForm({
  defaults,
}: {
  defaults: {
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
    project: number;
  };
}) {
  const [state, action, pending] = useActionState<PricingState, FormData>(
    savePricing,
    undefined,
  );

  return (
    <form action={action} className="space-y-5">
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
      {state?.success && (
        <div
          className="rounded-lg border p-3 text-sm"
          style={{
            backgroundColor: "#ecfdf5",
            borderColor: "#a7f3d0",
            color: "#065f46",
          }}
        >
          ✓ {state.success}
        </div>
      )}

      <PriceRow
        name="tier1"
        label="Tier 1 — Klein klusje"
        hint="1 dienst, klein (bijv. kraan vervangen, klein onderhoud)"
        defaultValue={defaults.tier1}
      />
      <PriceRow
        name="tier2"
        label="Tier 2 — Standaard klus"
        hint="1 dienst, normale grootte (halve tot hele dag werk)"
        defaultValue={defaults.tier2}
      />
      <PriceRow
        name="tier3"
        label="Tier 3 — Grote klus"
        hint="1 dienst, groot (meerdere dagen, meer materiaal)"
        defaultValue={defaults.tier3}
      />
      <PriceRow
        name="tier4"
        label="Tier 4 — Legacy"
        hint="(historisch) — wordt niet meer toegewezen aan nieuwe klussen"
        defaultValue={defaults.tier4}
      />
      <PriceRow
        name="project"
        label="Project (single-party)"
        hint="Multi-task klus die door één klusser wordt opgepakt (b.v. complete renovatie)"
        defaultValue={defaults.project}
      />

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn-yellow">
          {pending ? "Opslaan…" : "Prijzen opslaan"}
        </button>
      </div>
    </form>
  );
}

function PriceRow({
  name,
  label,
  hint,
  defaultValue,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue: number;
}) {
  return (
    <div
      className="grid sm:grid-cols-[1fr,160px] items-start gap-4 pb-5"
      style={{ borderBottom: "1px solid #eef2f7" }}
    >
      <div>
        <p className="font-bold text-[#1a2535]">{label}</p>
        <p className="text-sm text-[#5c6878] mt-1">{hint}</p>
      </div>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6878] font-bold"
          style={{ pointerEvents: "none" }}
        >
          €
        </span>
        <input
          type="number"
          name={name}
          min={1}
          step={1}
          required
          defaultValue={defaultValue}
          className="kb-input pl-7 text-right font-bold text-lg tabular-nums"
        />
      </div>
    </div>
  );
}
