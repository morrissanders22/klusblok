"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";

import { adminUpdateUser, type AdminUserState } from "../actions";

type Role = "CONSUMER" | "CONTRACTOR" | "ADMIN";

export function EditUserForm({
  userId,
  defaults,
}: {
  userId: string;
  defaults: {
    name: string;
    phone: string;
    role: Role;
    city: string;
    companyName: string;
    kvkNumber: string;
    hasLiabilityInsurance: boolean;
  };
}) {
  const action = adminUpdateUser.bind(null, userId);
  const [state, formAction, pending] = useActionState<AdminUserState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
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

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="kb-field-label">Naam</label>
          <input
            name="name"
            required
            defaultValue={defaults.name}
            className="kb-input"
          />
        </div>
        <div>
          <label className="kb-field-label">Telefoon</label>
          <input
            type="tel"
            name="phone"
            required
            defaultValue={defaults.phone}
            className="kb-input"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="kb-field-label">Rol</label>
          <select
            name="role"
            defaultValue={defaults.role}
            className="kb-input kb-select"
          >
            <option value="CONSUMER">Kluszoeker</option>
            <option value="CONTRACTOR">Klusser</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="kb-field-label">Plaats</label>
          <input
            name="city"
            defaultValue={defaults.city}
            className="kb-input"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="kb-field-label">Bedrijfsnaam (klusser)</label>
          <input
            name="companyName"
            defaultValue={defaults.companyName}
            className="kb-input"
          />
        </div>
        <div>
          <label className="kb-field-label">KVK-nummer (klusser)</label>
          <input
            name="kvkNumber"
            defaultValue={defaults.kvkNumber}
            placeholder="12345678"
            inputMode="numeric"
            pattern="\d{8}"
            className="kb-input"
          />
        </div>
      </div>

      {!defaults.hasLiabilityInsurance && defaults.role === "CONTRACTOR" && (
        <label
          className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
          style={{ backgroundColor: "#eff6fc", border: "1px solid #bfdbfe" }}
        >
          <input
            type="checkbox"
            name="confirmInsurance"
            className="mt-0.5"
          />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-[#1e40af] flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Markeer als verzekerd
            </span>
            <span className="text-[#1e40af]/80 text-xs block mt-1">
              Bevestigt de rechtsbijstandsverzekering namens de klusser.
            </span>
          </div>
        </label>
      )}

      <button type="submit" disabled={pending} className="btn-yellow">
        {pending ? "Opslaan…" : "Wijzigingen opslaan"}
      </button>
    </form>
  );
}
