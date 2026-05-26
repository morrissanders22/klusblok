"use client";

import { useActionState, useState } from "react";
import { Home, Hammer, ShieldCheck } from "lucide-react";

import {
  adminCreateUser,
  type AdminUserState,
} from "../actions";

type Role = "CONSUMER" | "CONTRACTOR" | "ADMIN";

export function NewUserForm() {
  const [role, setRole] = useState<Role>("CONSUMER");
  const [state, action, pending] = useActionState<AdminUserState, FormData>(
    adminCreateUser,
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

      <div>
        <label className="kb-field-label">Rol</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <RoleButton
            role="CONSUMER"
            current={role}
            onClick={() => setRole("CONSUMER")}
            Icon={Home}
            label="Kluszoeker"
          />
          <RoleButton
            role="CONTRACTOR"
            current={role}
            onClick={() => setRole("CONTRACTOR")}
            Icon={Hammer}
            label="Klusser"
          />
          <RoleButton
            role="ADMIN"
            current={role}
            onClick={() => setRole("ADMIN")}
            Icon={ShieldCheck}
            label="Admin"
          />
        </div>
        <input type="hidden" name="role" value={role} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="kb-field-label">Naam</label>
          <input name="name" required className="kb-input" />
        </div>
        <div>
          <label className="kb-field-label">E-mail</label>
          <input type="email" name="email" required className="kb-input" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="kb-field-label">Telefoon</label>
          <input type="tel" name="phone" required className="kb-input" />
        </div>
        <div>
          <label className="kb-field-label">Wachtwoord</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            placeholder="Minimaal 8 tekens"
            className="kb-input"
          />
        </div>
      </div>

      {role === "CONTRACTOR" && (
        <div
          className="rounded-lg p-4 space-y-4"
          style={{ backgroundColor: "#eff6fc", border: "1px solid #bfdbfe" }}
        >
          <p className="kb-eyebrow !opacity-100" style={{ color: "#1e40af" }}>
            Klusser-gegevens
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="kb-field-label">Bedrijfsnaam</label>
              <input name="companyName" className="kb-input" />
            </div>
            <div>
              <label className="kb-field-label">KVK-nummer</label>
              <input
                name="kvkNumber"
                placeholder="12345678"
                inputMode="numeric"
                pattern="\d{8}"
                className="kb-input"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-yellow w-full justify-center"
      >
        {pending ? "Aanmaken…" : "Klant aanmaken"}
      </button>
    </form>
  );
}

function RoleButton({
  role,
  current,
  onClick,
  Icon,
  label,
}: {
  role: Role;
  current: Role;
  onClick: () => void;
  Icon: typeof Home;
  label: string;
}) {
  const active = role === current;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-3 flex flex-col items-center gap-1.5 transition-all"
      style={{
        border: `2px solid ${active ? "#3586b6" : "#e2e8f0"}`,
        backgroundColor: active ? "#eff6fc" : "#fff",
        color: active ? "#1e40af" : "#5c6878",
      }}
    >
      <Icon size={18} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
