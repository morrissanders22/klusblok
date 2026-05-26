"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  updateProfile,
  updateBusiness,
  changePassword,
  type SettingsState,
} from "./actions";

function FeedbackBanner({ state }: { state: SettingsState }) {
  if (!state) return null;
  if (state.error)
    return (
      <div
        className="rounded-lg border p-3 text-sm mb-4"
        style={{
          backgroundColor: "#fef2f2",
          borderColor: "#fecaca",
          color: "#991b1b",
        }}
      >
        {state.error}
      </div>
    );
  if (state.success)
    return (
      <div
        className="rounded-lg border p-3 text-sm mb-4"
        style={{
          backgroundColor: "#ecfdf5",
          borderColor: "#a7f3d0",
          color: "#065f46",
        }}
      >
        ✓ {state.success}
      </div>
    );
  return null;
}

export function ProfileForm({
  defaults,
  showServiceRadius = false,
}: {
  defaults: {
    name: string;
    email: string;
    phone: string;
    city: string;
    postalCode: string;
    address: string;
    serviceRadiusKm?: number;
  };
  showServiceRadius?: boolean;
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <FeedbackBanner state={state} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="kb-field-label">Naam</label>
          <input
            name="name"
            defaultValue={defaults.name}
            required
            className="kb-input"
          />
        </div>
        <div>
          <label className="kb-field-label">E-mail</label>
          <input
            name="email"
            defaultValue={defaults.email}
            readOnly
            className="kb-input"
            style={{ backgroundColor: "#f7f9fc", color: "#9aa6b5" }}
          />
        </div>
      </div>
      <div>
        <label className="kb-field-label">Telefoonnummer</label>
        <input
          type="tel"
          name="phone"
          defaultValue={defaults.phone}
          required
          className="kb-input"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="kb-field-label">Plaats</label>
          <input
            name="city"
            defaultValue={defaults.city}
            className="kb-input"
          />
        </div>
        <div>
          <label className="kb-field-label">Postcode</label>
          <input
            name="postalCode"
            defaultValue={defaults.postalCode}
            className="kb-input"
          />
        </div>
      </div>
      <div>
        <label className="kb-field-label">Straat en huisnummer</label>
        <input
          name="address"
          defaultValue={defaults.address}
          className="kb-input"
        />
      </div>
      {showServiceRadius && (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: "#eff6fc", border: "1px solid #bfdbfe" }}
        >
          <label className="kb-field-label">
            Werkstraal vanaf jouw plaats
          </label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="range"
              name="serviceRadiusKm"
              min={5}
              max={200}
              step={5}
              defaultValue={defaults.serviceRadiusKm ?? 50}
              className="flex-1 accent-[#3586b6]"
              id="serviceRadiusKm"
            />
            <output
              htmlFor="serviceRadiusKm"
              className="font-bold text-[#1e40af] tabular-nums w-20 text-right"
            >
              {defaults.serviceRadiusKm ?? 50} km
            </output>
          </div>
          <p className="text-xs text-[#1e40af]/80 mt-2">
            Klusblok toont je klussen binnen deze straal van jouw plaats.
          </p>
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-yellow"
      >
        {pending ? "Opslaan…" : "Opslaan"}
      </button>
    </form>
  );
}

export function BusinessForm({
  defaults,
}: {
  defaults: {
    companyName: string;
    kvkNumber: string;
    hasLiabilityInsurance: boolean;
  };
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateBusiness,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <FeedbackBanner state={state} />
      <div>
        <label className="kb-field-label">Bedrijfsnaam</label>
        <input
          name="companyName"
          defaultValue={defaults.companyName}
          required
          className="kb-input"
        />
      </div>
      <div>
        <label className="kb-field-label">KVK-nummer</label>
        <input
          name="kvkNumber"
          defaultValue={defaults.kvkNumber}
          required
          inputMode="numeric"
          pattern="\d{8}"
          placeholder="12345678"
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
          defaultChecked={defaults.hasLiabilityInsurance}
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
      <button type="submit" disabled={pending} className="btn-yellow">
        {pending ? "Opslaan…" : "Bedrijfsgegevens opslaan"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    changePassword,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <FeedbackBanner state={state} />
      <div>
        <label className="kb-field-label">Huidig wachtwoord</label>
        <input
          type="password"
          name="current"
          required
          className="kb-input"
        />
      </div>
      <div>
        <label className="kb-field-label">Nieuw wachtwoord</label>
        <input
          type="password"
          name="next"
          required
          minLength={8}
          placeholder="Minstens 8 tekens"
          className="kb-input"
        />
      </div>
      <button type="submit" disabled={pending} className="btn-yellow">
        {pending ? "Wijzigen…" : "Wachtwoord wijzigen"}
      </button>
    </form>
  );
}
