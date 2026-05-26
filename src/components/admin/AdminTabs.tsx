"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Users,
  Tag,
  ChevronDown,
  Hammer,
  Home,
  Mail,
  Plug,
} from "lucide-react";

type Tab = {
  href: string;
  label: string;
  Icon: typeof BarChart3;
  match: (path: string) => boolean;
  sub?: { href: string; label: string; Icon: typeof Hammer }[];
};

const TABS: Tab[] = [
  {
    href: "/admin",
    label: "Overzicht",
    Icon: BarChart3,
    match: (p) => p === "/admin",
  },
  {
    href: "/admin/klanten/klussers",
    label: "Klanten",
    Icon: Users,
    match: (p) => p.startsWith("/admin/klanten"),
    sub: [
      { href: "/admin/klanten/klussers", label: "Kluszoekers", Icon: Hammer },
      {
        href: "/admin/klanten/kluszoekers",
        label: "Klusplaatsers",
        Icon: Home,
      },
    ],
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    Icon: BarChart3,
    match: (p) => p.startsWith("/admin/analytics"),
  },
  {
    href: "/admin/prijzen",
    label: "Prijzen",
    Icon: Tag,
    match: (p) => p.startsWith("/admin/prijzen"),
  },
  {
    href: "/admin/emails",
    label: "E-mails",
    Icon: Mail,
    match: (p) => p.startsWith("/admin/emails"),
  },
  {
    href: "/admin/integraties",
    label: "Integraties",
    Icon: Plug,
    match: (p) => p.startsWith("/admin/integraties"),
  },
];

export function AdminTabs() {
  const path = usePathname();
  const [openSub, setOpenSub] = useState<string | null>(null);

  return (
    <nav
      className="flex items-center gap-2 mb-6 border-b"
      style={{ borderColor: "#e2e8f0" }}
    >
      {TABS.map((tab) => {
        const active = tab.match(path);
        const hasSub = !!tab.sub;
        return (
          <div key={tab.label} className="relative">
            {hasSub ? (
              <button
                type="button"
                onClick={() => setOpenSub(openSub === tab.label ? null : tab.label)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors"
                style={{
                  color: active ? "#1a2535" : "#5c6878",
                  borderBottom: `3px solid ${active ? "#f6b42c" : "transparent"}`,
                }}
              >
                <tab.Icon size={16} />
                {tab.label}
                <ChevronDown
                  size={14}
                  style={{
                    transform: openSub === tab.label ? "rotate(180deg)" : "none",
                    transition: "transform 0.15s",
                  }}
                />
              </button>
            ) : (
              <Link
                href={tab.href}
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors hover:text-[#1a2535]"
                style={{
                  color: active ? "#1a2535" : "#5c6878",
                  borderBottom: `3px solid ${active ? "#f6b42c" : "transparent"}`,
                }}
              >
                <tab.Icon size={16} />
                {tab.label}
              </Link>
            )}
            {hasSub && openSub === tab.label && (
              <div
                className="absolute top-full left-0 mt-1 rounded-lg shadow-lg overflow-hidden z-10"
                style={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  minWidth: "200px",
                }}
                onMouseLeave={() => setOpenSub(null)}
              >
                {tab.sub!.map((s) => {
                  const subActive = path === s.href;
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setOpenSub(null)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors"
                      style={{
                        color: subActive ? "#1e4f70" : "#1a2535",
                        backgroundColor: subActive ? "#eff6fc" : "transparent",
                      }}
                    >
                      <s.Icon size={14} />
                      {s.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
