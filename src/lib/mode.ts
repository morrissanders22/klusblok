import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

export type Mode = "kluszoeker" | "klusser";

export const MODE_COOKIE = "kb-mode";

export type Capabilities = {
  canPost: boolean;
  canClaim: boolean;
};

export function getCapabilities(user: {
  kvkNumber: string | null;
  hasLiabilityInsurance: boolean;
}): Capabilities {
  return {
    canPost: true,
    // Insurance is grace-checked at action level — registration only requires KVK.
    canClaim: !!user.kvkNumber,
  };
}

export function defaultMode(role: Role): Mode {
  if (role === "CONTRACTOR") return "klusser";
  return "kluszoeker";
}

/**
 * The cookie always wins — users explicitly switching to klusser-mode
 * should see the klusser UI, even if they haven't filled in KVK yet.
 * When they try to actually claim, they're routed to the upgrade flow.
 */
export async function getEffectiveMode(role: Role): Promise<Mode> {
  const store = await cookies();
  const requested = store.get(MODE_COOKIE)?.value as Mode | undefined;
  if (requested === "klusser" || requested === "kluszoeker") {
    return requested;
  }
  return defaultMode(role);
}

export function hasBothModes(caps: Capabilities): boolean {
  return caps.canPost && caps.canClaim;
}
