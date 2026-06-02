"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { adminLoginAction, type AdminLoginState } from "./actions";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<AdminLoginState, FormData>(
    adminLoginAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label
          className="block text-[11px] uppercase tracking-wider font-bold mb-1.5"
          style={{ color: "#f7c021" }}
        >
          Admin e-mail
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="admin@klusblok.nl"
          className="w-full rounded-lg px-3 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            color: "white",
          }}
        />
      </div>
      <div>
        <label
          className="block text-[11px] uppercase tracking-wider font-bold mb-1.5"
          style={{ color: "#f7c021" }}
        >
          Wachtwoord
        </label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-lg px-3 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1.5px solid rgba(255,255,255,0.1)",
            color: "white",
          }}
        />
      </div>
      {state?.error && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{
            backgroundColor: "rgba(220,38,38,0.15)",
            border: "1px solid rgba(220,38,38,0.4)",
            color: "#fca5a5",
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
        <LogIn size={16} />
        {pending ? "Inloggen…" : "Inloggen als admin"}
      </button>
    </form>
  );
}
