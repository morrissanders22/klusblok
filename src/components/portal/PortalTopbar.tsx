import Link from "next/link";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/Logo";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  CONTRACTOR: "Kluszoeker",
  CONSUMER: "Klusplaatser",
};

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "#f7c021",
  CONTRACTOR: "#3586b6",
  CONSUMER: "#10b981",
};

export async function PortalTopbar() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true },
  });
  if (!user) return null;

  const roleLabel = ROLE_LABEL[user.role] ?? user.role;
  const roleColor = ROLE_COLOR[user.role] ?? "#3586b6";

  return (
    <header
      style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0" }}
      className="sticky top-0 z-30"
    >
      <div className="h-[64px] flex items-center justify-between px-4 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <Logo size={24} variant="black" />
          <span
            className="kb-badge text-[10px]"
            style={{
              backgroundColor: `${roleColor}1a`,
              color: roleColor,
              border: `1px solid ${roleColor}40`,
            }}
          >
            {roleLabel}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-3">
          <span
            className="text-[11px] uppercase tracking-[2px] font-bold flex items-center gap-1.5"
            style={{ color: roleColor }}
          >
            {user.role === "ADMIN" && <ShieldCheck size={12} />}
            {roleLabel}
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
              <p
                className="text-[11px] mt-1 uppercase tracking-wider"
                style={{ color: roleColor }}
              >
                {roleLabel}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ backgroundColor: "#f7c021", color: "#0f2535" }}
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
