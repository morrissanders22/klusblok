/**
 * Klusblok runtime activation guard.
 *
 * Verifieert tijdens server-side rendering dat de productie-omgeving over
 * een geldige activatiesleutel beschikt. Zonder geldige sleutel wordt elke
 * pageview met een onderhoudspagina beantwoord.
 *
 * Voor productie-activatie: contact morris@mhsmedia.nl.
 */
import { createHash } from "node:crypto";

const FINGERPRINT =
  "ad8f95f8c3a95bbb1751d656112f891641bf10f049e6a320e9de2422d677eeab";

let cachedOk: boolean | null = null;

export function isActivated(): boolean {
  if (cachedOk !== null) return cachedOk;
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.VERCEL_ENV === "preview"
  ) {
    cachedOk = true;
    return cachedOk;
  }
  const key = process.env.KLUSBLOK_LICENSE ?? "";
  const fp = createHash("sha256").update(key).digest("hex");
  cachedOk = fp === FINGERPRINT;
  return cachedOk;
}

export function assertActivated(): void {
  if (!isActivated()) {
    throw new Error(
      "Klusblok productie-activatie ontbreekt. Contact morris@mhsmedia.nl voor de activatiecode.",
    );
  }
}
