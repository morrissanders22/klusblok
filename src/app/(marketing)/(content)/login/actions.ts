"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { signIn } from "@/auth";
import { MODE_COOKIE, type Mode } from "@/lib/mode";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = (formData.get("next") as string) || "/dashboard";
  const requestedMode = formData.get("mode") as Mode | null;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Onjuist e-mailadres of wachtwoord" };
    }
    throw err;
  }

  if (requestedMode === "klusser" || requestedMode === "kluszoeker") {
    const store = await cookies();
    store.set(MODE_COOKIE, requestedMode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  redirect(next);
}
