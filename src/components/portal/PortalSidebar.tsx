import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  BookmarkCheck,
  ShieldCheck,
  ExternalLink,
  Settings,
  Star,
  ClipboardList,
  Hammer,
} from "lucide-react";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { getCapabilities, getEffectiveMode, type Mode } from "@/lib/mode";
import { Logo } from "@/components/Logo";
import { ModeSwitcher } from "./ModeSwitcher";

type Item = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  modes: Mode[];
  adminOnly?: boolean;
};

const PRIMARY_ITEMS: Item[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    modes: ["kluszoeker", "klusser"],
  },
  // Kluszoeker
  {
    href: "/jobs/new",
    label: "Plaats klus",
    Icon: Plus,
    modes: ["kluszoeker"],
  },
  {
    href: "/dashboard#mijn-klussen",
    label: "Mijn klussen",
    Icon: ClipboardList,
    modes: ["kluszoeker"],
  },
  {
    href: "/klussers",
    label: "Vind klussers",
    Icon: Briefcase,
    modes: ["kluszoeker"],
  },
  // Klusser
  {
    href: "/jobs",
    label: "Open klussen",
    Icon: Briefcase,
    modes: ["klusser"],
  },
  {
    href: "/dashboard#leads",
    label: "Mijn leads",
    Icon: BookmarkCheck,
    modes: ["klusser"],
  },
  {
    href: "/reviews",
    label: "Reviews",
    Icon: Star,
    modes: ["klusser"],
  },
];

const SECONDARY_ITEMS: Item[] = [
  {
    href: "/instellingen",
    label: "Instellingen",
    Icon: Settings,
    modes: ["kluszoeker", "klusser"],
  },
  {
    href: "/admin",
    label: "Admin",
    Icon: ShieldCheck,
    modes: ["kluszoeker", "klusser"],
    adminOnly: true,
  },
];

export async function PortalSidebar() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      kvkNumber: true,
      hasLiabilityInsurance: true,
      role: true,
      name: true,
      email: true,
    },
  });
  if (!user) return null;

  const caps = getCapabilities(user);
  const mode = await getEffectiveMode(user.role);

  const isAdmin = user.role === "ADMIN";
  const primary = PRIMARY_ITEMS.filter(
    (i) => i.modes.includes(mode) && (!i.adminOnly || isAdmin),
  );
  const secondary = SECONDARY_ITEMS.filter(
    (i) => i.modes.includes(mode) && (!i.adminOnly || isAdmin),
  );

  return (
    <aside
      style={{
        backgroundColor: "#0f2535",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
      className="hidden lg:flex w-[240px] flex-col fixed inset-y-0 left-0 z-40 h-screen"
    >
      <div
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        className="p-5"
      >
        <Link href="/" className="flex flex-col items-start gap-1 mb-4">
          <Logo size={26} variant="light" />
          <span
            className="text-[10px] uppercase tracking-[2px]"
            style={{ color: "#f6b42c" }}
          >
            Software
          </span>
        </Link>

        <ModeSwitcher mode={mode} caps={caps} />
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {primary.map(({ href, label, Icon }) => (
          <SidebarLink key={href} href={href} label={label} Icon={Icon} />
        ))}

        {mode === "klusser" && !caps.canClaim && (
          <Link
            href="/word-klusser"
            className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-lg text-[#f6b42c] hover:bg-white/5 transition-colors text-sm font-semibold"
            style={{ border: "1px dashed rgba(246,180,44,0.35)" }}
          >
            <Hammer size={16} /> KVK toevoegen
          </Link>
        )}

        {secondary.length > 0 && (
          <div
            className="pt-3 mt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {secondary.map(({ href, label, Icon }) => (
              <SidebarLink key={href} href={href} label={label} Icon={Icon} />
            ))}
          </div>
        )}
      </nav>

      <div
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        className="p-3 space-y-1"
      >
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-[#f6b42c] hover:bg-white/5 transition-colors text-sm font-medium"
        >
          <ExternalLink size={16} />
          Bekijk publieke site
        </Link>
        <div className="px-3 pt-3">
          <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">
            {mode === "klusser" ? "Klusser-modus" : "Kluszoeker-modus"}
          </p>
          <p className="text-sm text-white truncate" title={user.email}>
            {user.name}
          </p>
          <p className="text-xs text-white/50 truncate mb-3">{user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-xs text-white/60 hover:text-white"
            >
              Uitloggen →
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/75 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}
