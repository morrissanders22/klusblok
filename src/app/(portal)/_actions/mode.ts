"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { MODE_COOKIE, type Mode } from "@/lib/mode";

export async function setMode(mode: Mode): Promise<void> {
  const store = await cookies();
  store.set(MODE_COOKIE, mode, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
