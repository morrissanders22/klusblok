"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, ShieldCheck, Search, Home, Hammer } from "lucide-react";

import { adminImpersonateUser } from "@/app/(portal)/admin/klanten/actions";

export type SwitchableUser = {
  id: string;
  name: string;
  email: string;
  city: string | null;
  companyName: string | null;
  role: "CONSUMER" | "CONTRACTOR" | "ADMIN";
};

export function AdminUserSwitcher({ users }: { users: SwitchableUser[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const { klusplaatsers, kluszoekers } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (u: SwitchableUser) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.companyName?.toLowerCase().includes(q) ?? false) ||
      (u.city?.toLowerCase().includes(q) ?? false);
    return {
      klusplaatsers: users.filter((u) => u.role === "CONSUMER" && match(u)),
      kluszoekers: users.filter((u) => u.role === "CONTRACTOR" && match(u)),
    };
  }, [users, query]);

  function impersonate(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await adminImpersonateUser(id);
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] uppercase tracking-[2px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-neutral-100 transition-colors"
        style={{ color: "#f7c021" }}
      >
        <ShieldCheck size={12} />
        Admin
        <ChevronDown
          size={12}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 120ms",
          }}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-[320px] rounded-xl bg-white z-50 overflow-hidden"
          style={{
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 32px rgba(15,37,53,0.12)",
          }}
        >
          <div
            className="p-3"
            style={{ borderBottom: "1px solid #eef2f7" }}
          >
            <p className="text-[10px] uppercase tracking-[2px] font-bold text-[#5c6878] mb-2">
              Inloggen als klant
            </p>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa6b5]"
              />
              <input
                type="text"
                placeholder="Zoek op naam, e-mail, bedrijf…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-sm rounded-md"
                style={{ border: "1px solid #e2e8f0" }}
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            <UserGroup
              label="Klusplaatsers"
              Icon={Home}
              accent="#10b981"
              users={klusplaatsers}
              pendingId={pendingId}
              onPick={impersonate}
            />
            <UserGroup
              label="Kluszoekers"
              Icon={Hammer}
              accent="#3586b6"
              users={kluszoekers}
              pendingId={pendingId}
              onPick={impersonate}
            />
            {klusplaatsers.length === 0 && kluszoekers.length === 0 && (
              <p className="text-xs text-[#5c6878] text-center py-6 px-3">
                Geen klanten gevonden
                {query ? ` voor "${query}"` : ""}.
              </p>
            )}
          </div>

          <div
            className="p-2.5"
            style={{ borderTop: "1px solid #eef2f7" }}
          >
            <Link
              href="/admin/klanten/klussers"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-bold text-[#3586b6] hover:underline py-1.5"
            >
              Alle klanten beheren →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function UserGroup({
  label,
  Icon,
  accent,
  users,
  pendingId,
  onPick,
}: {
  label: string;
  Icon: typeof Home;
  accent: string;
  users: SwitchableUser[];
  pendingId: string | null;
  onPick: (id: string) => void;
}) {
  if (users.length === 0) return null;
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-[2px] font-bold px-3 pt-3 pb-1.5 flex items-center gap-1.5"
        style={{ color: accent }}
      >
        <Icon size={10} />
        {label} · {users.length}
      </p>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <button
              type="button"
              disabled={pendingId !== null}
              onClick={() => onPick(u.id)}
              className="w-full text-left px-3 py-2 hover:bg-[#f7f9fc] transition-colors flex items-center gap-2.5 disabled:opacity-50"
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: `${accent}1a`, color: accent }}
              >
                {(u.companyName ?? u.name).slice(0, 2).toUpperCase()}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-[#1a2535] truncate">
                  {u.companyName ?? u.name}
                </span>
                <span className="block text-[11px] text-[#5c6878] truncate">
                  {u.email}
                  {u.city ? ` · ${u.city}` : ""}
                </span>
              </span>
              {pendingId === u.id && (
                <span className="text-[10px] font-bold text-[#5c6878]">
                  …
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
