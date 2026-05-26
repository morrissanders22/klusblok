import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { getEffectiveMode } from "@/lib/mode";
import { Logo } from "@/components/Logo";

export async function PortalTopbar() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      kvkNumber: true,
      hasLiabilityInsurance: true,
      role: true,
      name: true,
    },
  });
  if (!user) return null;

  const mode = await getEffectiveMode(user.role);

  return (
    <header
      style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}
      className="sticky top-0 z-30"
    >
      <div className="h-[64px] flex items-center justify-between px-4 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Logo size={24} />
          <span className="kb-badge kb-badge--yellow text-[10px]">Portal</span>
        </Link>

        <div className="hidden lg:flex items-center gap-3">
          <span className="kb-eyebrow !opacity-100">
            {mode === "klusser" ? "Klusser-modus" : "Kluszoeker-modus"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#5c6878] hover:text-[#1a2535] transition-colors"
          >
            <ExternalLink size={14} />
            Bekijk publieke site
          </Link>

          <div
            style={{ borderLeft: "1px solid #e2e8f0" }}
            className="hidden sm:flex items-center gap-3 pl-3"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-[#1a2535] leading-none">
                {user.name}
              </p>
              <p className="text-[11px] text-[#5c6878] mt-1 uppercase tracking-wider">
                {user.role.toLowerCase()}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#f6b42c", color: "#0f2535" }}
            >
              {user.name?.slice(0, 2).toUpperCase() ?? "U"}
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="p-2 rounded-md text-[#5c6878] hover:text-[#1a2535] hover:bg-neutral-100"
              aria-label="Uitloggen"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
