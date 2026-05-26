"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, auth } from "@/auth";

export type AdminLoginState = { error?: string } | undefined;

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

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

  // Verify the just-signed-in user is actually an admin
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Geen admin-rechten voor dit account." };
  }

  redirect("/admin");
}
