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
  Users,
  Hammer,
  BarChart3,
  Mail,
  Plug,
  Tag,
} from "lucide-react";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { Logo } from "@/components/Logo";

type Role = "ADMIN" | "CONTRACTOR" | "CONSUMER";

type Item = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
};

const ADMIN_ITEMS: Item[] = [
  { href: "/admin", label: "Overzicht", Icon: LayoutDashboard },
  { href: "/admin/klanten/klussers", label: "Klanten", Icon: Users },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/prijzen", label: "Prijzen", Icon: Tag },
  { href: "/admin/emails", label: "E-mails", Icon: Mail },
  { href: "/admin/integraties", label: "Integraties", Icon: Plug },
];

// Klusplaatser = consumer (places klussen) — wat we intern CONSUMER noemen
const KLUSPLAATSER_ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/jobs/new", label: "Plaats klus", Icon: Plus },
  { href: "/dashboard#mijn-klussen", label: "Mijn klussen", Icon: ClipboardList },
  { href: "/klussers", label: "Vind kluszoeker", Icon: Briefcase },
];

// Kluszoeker = contractor (seeks klussen) — wat we intern CONTRACTOR noemen
const KLUSZOEKER_ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/jobs", label: "Open klussen", Icon: Briefcase },
  { href: "/dashboard#leads", label: "Mijn leads", Icon: BookmarkCheck },
  { href: "/reviews", label: "Reviews", Icon: Star },
];

const SETTINGS_ITEM: Item = {
  href: "/instellingen",
  label: "Instellingen",
  Icon: Settings,
};

function itemsForRole(role: Role): { primary: Item[]; secondary: Item[] } {
  if (role === "ADMIN") {
    return { primary: ADMIN_ITEMS, secondary: [SETTINGS_ITEM] };
  }
  if (role === "CONTRACTOR") {
    return { primary: KLUSZOEKER_ITEMS, secondary: [SETTINGS_ITEM] };
  }
  return { primary: KLUSPLAATSER_ITEMS, secondary: [SETTINGS_ITEM] };
}

function roleSubtitle(role: Role): { label: string; color: string } {
  if (role === "ADMIN") return { label: "Admin", color: "#f6b42c" };
  if (role === "CONTRACTOR")
    return { label: "Kluszoeker", color: "#3586b6" };
  return { label: "Klusplaatser", color: "#10b981" };
}

export async function PortalSidebar() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      role: true,
      name: true,
      email: true,
      kvkNumber: true,
    },
  });
  if (!user) return null;

  const role = user.role as Role;
  const { primary, secondary } = itemsForRole(role);
  const subtitle = roleSubtitle(role);
  const showKvkPrompt = role === "CONTRACTOR" && !user.kvkNumber;

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
        <Link href="/" className="flex flex-col items-start gap-1">
          <Logo size={26} variant="light" />
          <span
            className="text-[10px] uppercase tracking-[2px]"
            style={{ color: subtitle.color }}
          >
            {subtitle.label}
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {primary.map(({ href, label, Icon }) => (
          <SidebarLink key={href} href={href} label={label} Icon={Icon} />
        ))}

        {showKvkPrompt && (
          <Link
            href="/word-klusser"
            className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-lg text-[#f6b42c] hover:bg-white/5 transition-colors text-sm font-semibold"
            style={{ border: "1px dashed rgba(246,180,44,0.35)" }}
          >
            <Hammer size={16} /> Vul KVK aan
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
          <p
            className="text-[11px] uppercase tracking-wider mb-1"
            style={{ color: subtitle.color, opacity: 0.7 }}
          >
            {subtitle.label === "Admin" ? (
              <span className="flex items-center gap-1">
                <ShieldCheck size={10} /> {subtitle.label}
              </span>
            ) : (
              subtitle.label
            )}
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
