import Link from "next/link";
import { Mail, ShieldAlert } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { insuranceGraceDaysLeft, insuranceRequired } from "@/lib/insurance";

export async function VerifyBanner() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailVerified: true,
      email: true,
      role: true,
      createdAt: true,
      insuranceConfirmedAt: true,
    },
  });
  if (!user) return null;

  if (!user.emailVerified) {
    return (
      <div
        className="rounded-xl border p-4 flex items-center gap-3 mb-6"
        style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#f6b42c", color: "#1a2535" }}
        >
          <Mail size={18} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#92400e]">Bevestig je e-mailadres</p>
          <p className="text-sm text-[#92400e]">
            Verificatielink verstuurd naar <strong>{user.email}</strong>. Je
            kunt nog niet plaatsen of claimen zonder geverifieerd account.
          </p>
        </div>
        <Link
          href={`/verify/check?email=${encodeURIComponent(user.email)}`}
          className="text-sm font-bold text-[#92400e] hover:underline whitespace-nowrap"
        >
          Opnieuw versturen →
        </Link>
      </div>
    );
  }

  // Insurance grace period banner (klusser only)
  if (user.role === "CONTRACTOR") {
    const status = insuranceRequired(user.createdAt, user.insuranceConfirmedAt);
    if (status === "warn") {
      const daysLeft = insuranceGraceDaysLeft(user.createdAt);
      return (
        <div
          className="rounded-xl border p-4 flex items-center gap-3 mb-6"
          style={{ backgroundColor: "#eff6fc", borderColor: "#bfdbfe" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#3586b6", color: "white" }}
          >
            <ShieldAlert size={18} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#1e40af]">
              Nog {daysLeft} {daysLeft === 1 ? "dag" : "dagen"} om je
              rechtsbijstandsverzekering toe te voegen
            </p>
            <p className="text-sm text-[#1e40af]/80">
              Na deze periode kun je geen klussen meer claimen zonder
              bevestigde verzekering.
            </p>
          </div>
          <Link
            href="/instellingen#verzekering"
            className="text-sm font-bold text-[#1e40af] hover:underline whitespace-nowrap"
          >
            Nu toevoegen →
          </Link>
        </div>
      );
    }
    if (status === "blocked") {
      return (
        <div
          className="rounded-xl border p-4 flex items-center gap-3 mb-6"
          style={{ backgroundColor: "#fef2f2", borderColor: "#fecaca" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#dc2626", color: "white" }}
          >
            <ShieldAlert size={18} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#991b1b]">
              Rechtsbijstandsverzekering verplicht
            </p>
            <p className="text-sm text-[#991b1b]/80">
              Je grace-periode van 30 dagen is voorbij. Voeg je verzekering
              toe om weer klussen te kunnen claimen.
            </p>
          </div>
          <Link
            href="/instellingen#verzekering"
            className="text-sm font-bold text-[#991b1b] hover:underline whitespace-nowrap"
          >
            Verzekering toevoegen →
          </Link>
        </div>
      );
    }
  }

  return null;
}
