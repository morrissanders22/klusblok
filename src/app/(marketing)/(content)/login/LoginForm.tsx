"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import type { Mode } from "@/lib/mode";

export function LoginForm({
  mode,
  registerHref,
}: {
  mode?: Mode;
  registerHref?: string;
}) {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <>
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        {mode && <input type="hidden" name="mode" value={mode} />}
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
          <label className="kb-field-label">Wachtwoord</label>
          <input
            type="password"
            name="password"
            required
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
          {pending ? "Inloggen…" : "Inloggen"}
        </button>
      </form>
      <p className="mt-5 text-sm text-[#5c6878] text-center">
        Nog geen account?{" "}
        <Link
          href={registerHref ?? "/register"}
          className="text-[#3586b6] font-bold hover:underline"
        >
          Registreer hier
        </Link>
      </p>
    </>
  );
}
