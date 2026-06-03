import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  BookmarkCheck,
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
  LogOut,
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

const KLUSPLAATSER_ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/jobs/new", label: "Plaats klus", Icon: Plus },
  { href: "/dashboard#mijn-klussen", label: "Mijn klussen", Icon: ClipboardList },
  { href: "/klussers", label: "Vind kluszoeker", Icon: Briefcase },
];

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

const ROLE_META: Record<Role, { label: string; accent: string }> = {
  ADMIN: { label: "Admin portaal", accent: "#f7c021" },
  CONTRACTOR: { label: "Kluszoeker portaal", accent: "#3586b6" },
  CONSUMER: { label: "Klusplaatser portaal", accent: "#10b981" },
};

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
  const meta = ROLE_META[role];
  const showKvkPrompt = role === "CONTRACTOR" && !user.kvkNumber;
  const initials = user.name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <aside
      style={{
        backgroundColor: "white",
        borderRight: "1px solid #e8ecf2",
      }}
      className="hidden lg:flex w-[240px] flex-col fixed inset-y-0 left-0 z-40 h-screen"
    >
      {/* Header — match marketing site styling */}
      <div
        className="p-6"
        style={{ borderBottom: "1px solid #eef2f7" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={28} variant="black" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {primary.map(({ href, label, Icon }) => (
          <SidebarLink key={href} href={href} label={label} Icon={Icon} />
        ))}

        {showKvkPrompt && (
          <Link
            href="/word-klusser"
            className="flex items-center gap-3 mt-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            style={{
              color: "#92400e",
              backgroundColor: "#fffbeb",
              border: "1px dashed #fde68a",
            }}
          >
            <Hammer size={16} /> Vul KVK aan
          </Link>
        )}

        {secondary.length > 0 && (
          <div
            className="pt-4 mt-4"
            style={{ borderTop: "1px solid #eef2f7" }}
          >
            {secondary.map(({ href, label, Icon }) => (
              <SidebarLink key={href} href={href} label={label} Icon={Icon} />
            ))}
          </div>
        )}
      </nav>

      {/* Footer — user + actions */}
      <div
        className="p-3"
        style={{ borderTop: "1px solid #eef2f7" }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#5c6878] hover:text-[#1a2535] hover:bg-[#f7f9fc] transition-colors mb-1"
        >
          <ExternalLink size={14} />
          Bekijk publieke site
        </Link>

        <div
          className="mt-2 rounded-xl p-3 flex items-center gap-3"
          style={{ backgroundColor: "#f7f9fc" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: meta.accent, color: "white" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold text-[#1a2535] truncate"
              title={user.email}
            >
              {user.name}
            </p>
            <p className="text-[11px] text-[#5c6878] truncate">{user.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="p-1.5 rounded-md text-[#5c6878] hover:text-[#dc2626] hover:bg-white transition-colors"
              aria-label="Uitloggen"
            >
              <LogOut size={14} />
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
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-[#5c6878] hover:text-[#1a2535] hover:bg-[#f7f9fc] transition-colors"
    >
      <Icon size={17} />
      {label}
    </Link>
  );
}
