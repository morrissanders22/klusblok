"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Hammer, Wrench, Zap, Brush, Sparkles } from "lucide-react";

import { Reveal } from "@/components/Reveal";

export type KlusItem = {
  id: string;
  title: string;
  description: string;
  city: string;
  createdAt: string;
  firstService: string;
};

const FILTERS = [
  "Alle",
  "Timmerwerk",
  "Loodgieterswerk",
  "Elektriciteit",
  "Schilderwerk",
] as const;

const SERVICE_STYLE: Record<
  string,
  { bg: string; text: string; border: string; Icon: typeof Hammer }
> = {
  Timmerwerk: {
    bg: "#fef3c7",
    text: "#92400e",
    border: "#fde68a",
    Icon: Hammer,
  },
  Loodgieterswerk: {
    bg: "#dbeafe",
    text: "#1e40af",
    border: "#bfdbfe",
    Icon: Wrench,
  },
  Elektriciteit: {
    bg: "#d1fae5",
    text: "#065f46",
    border: "#a7f3d0",
    Icon: Zap,
  },
  Schilderwerk: {
    bg: "#fce7f3",
    text: "#9d174d",
    border: "#fbcfe8",
    Icon: Brush,
  },
};

const DEFAULT_STYLE = {
  bg: "#f3f4f6",
  text: "#374151",
  border: "#e5e7eb",
  Icon: Sparkles,
};

export function KlussenGrid({ items }: { items: KlusItem[] }) {
  const [active, setActive] = useState<(typeof FILTERS)[number]>("Alle");

  const filtered = useMemo(
    () => (active === "Alle" ? items : items.filter((k) => k.firstService === active)),
    [active, items],
  );

  return (
    <>
      <Reveal delay={100}>
        <div className="flex gap-2.5 flex-wrap mb-9">
          {FILTERS.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                style={{
                  padding: "7px 16px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `2px solid ${isActive ? "#3586b6" : "#e8ecf2"}`,
                  backgroundColor: isActive ? "#3586b6" : "#f4f7fa",
                  color: isActive ? "white" : "#5c6878",
                  transition: "all 0.2s",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <p className="text-[#5c6878] text-center py-8">
          Geen klussen in deze categorie.
        </p>
      ) : (
        <div
          className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((klus, i) => {
            const style = SERVICE_STYLE[klus.firstService] ?? DEFAULT_STYLE;
            const { Icon } = style;
            return (
              <Reveal key={klus.id} delay={i * 80} dir="up">
                <Link href={`/jobs/${klus.id}`} className="block kb-card">
                  <div className="p-6 pb-5">
                    <div className="flex justify-between items-start mb-3.5">
                      <span
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          border: `1px solid ${style.border}`,
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Icon size={13} /> {klus.firstService}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#5c6878]">
                        <MapPin size={12} /> {klus.city}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#1a2535] mb-2 leading-snug">
                      {klus.title}
                    </h3>
                    <p className="text-sm text-[#5c6878] leading-relaxed mb-5 line-clamp-2">
                      {klus.description}
                    </p>
                    <div
                      style={{ borderTop: "1px solid #f1f5f9" }}
                      className="flex justify-between items-center pt-4"
                    >
                      <span className="text-[11px] text-[#9ca3af]">
                        {klus.createdAt}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-bold text-[#3586b6]">
                        Bekijk klus <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </>
  );
}
