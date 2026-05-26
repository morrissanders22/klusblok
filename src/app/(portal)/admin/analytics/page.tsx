import { redirect } from "next/navigation";
import { BarChart3, TrendingUp, Users, Briefcase, Wallet } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/services";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

type DayBucket = {
  date: string; // YYYY-MM-DD
  signups: number;
  jobs: number;
  payments: number;
  revenueCents: number;
};

function emptyBuckets(days: number): DayBucket[] {
  const buckets: DayBucket[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY);
    buckets.push({
      date: d.toISOString().slice(0, 10),
      signups: 0,
      jobs: 0,
      payments: 0,
      revenueCents: 0,
    });
  }
  return buckets;
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const days = 30;
  const since = new Date(Date.now() - days * DAY);

  const [users, jobs, payments, jobsByType, jobsByCity] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, role: true },
    }),
    prisma.job.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, type: true },
    }),
    prisma.payment.findMany({
      where: { status: "PAID", paidAt: { gte: since } },
      select: { paidAt: true, amountCents: true },
    }),
    prisma.job.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.job.groupBy({
      by: ["city"],
      _count: { _all: true },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
  ]);

  const buckets = emptyBuckets(days);
  const byDate = new Map(buckets.map((b) => [b.date, b]));

  for (const u of users) {
    const k = u.createdAt.toISOString().slice(0, 10);
    const b = byDate.get(k);
    if (b) b.signups += 1;
  }
  for (const j of jobs) {
    const k = j.createdAt.toISOString().slice(0, 10);
    const b = byDate.get(k);
    if (b) b.jobs += 1;
  }
  for (const p of payments) {
    if (!p.paidAt) continue;
    const k = p.paidAt.toISOString().slice(0, 10);
    const b = byDate.get(k);
    if (b) {
      b.payments += 1;
      b.revenueCents += p.amountCents;
    }
  }

  const totals = buckets.reduce(
    (acc, b) => ({
      signups: acc.signups + b.signups,
      jobs: acc.jobs + b.jobs,
      payments: acc.payments + b.payments,
      revenueCents: acc.revenueCents + b.revenueCents,
    }),
    { signups: 0, jobs: 0, payments: 0, revenueCents: 0 },
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="kb-eyebrow flex items-center gap-2">
          <BarChart3 size={12} /> Analytics
        </p>
        <h1 className="kb-heading text-3xl mt-2">
          Trends over de laatste 30 dagen
        </h1>
        <p className="text-[#5c6878] mt-2">
          Dagelijkse activiteit op het platform: aanmeldingen, geplaatste
          klussen en betalingen.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Aanmeldingen"
          value={totals.signups.toString()}
          Icon={Users}
          accent="#10b981"
        />
        <Stat
          label="Klussen geplaatst"
          value={totals.jobs.toString()}
          Icon={Briefcase}
          accent="#3586b6"
        />
        <Stat
          label="Betaalde claims"
          value={totals.payments.toString()}
          Icon={TrendingUp}
          accent="#f6b42c"
        />
        <Stat
          label="Omzet 30 dagen"
          value={formatEuro(totals.revenueCents)}
          Icon={Wallet}
          accent="#1e4f70"
        />
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-1">Aanmeldingen per dag</h2>
        <p className="text-sm text-[#5c6878] mb-5">
          Aantal nieuwe accounts per dag (klusplaatsers + kluszoekers).
        </p>
        <Sparkline
          buckets={buckets}
          accessor={(b) => b.signups}
          color="#10b981"
        />
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-1">Klussen per dag</h2>
        <p className="text-sm text-[#5c6878] mb-5">
          Aantal nieuwe klussen geplaatst per dag.
        </p>
        <Sparkline
          buckets={buckets}
          accessor={(b) => b.jobs}
          color="#3586b6"
        />
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-1">Omzet per dag</h2>
        <p className="text-sm text-[#5c6878] mb-5">
          Geïncasseerd via Mollie per dag, in euro&apos;s.
        </p>
        <Sparkline
          buckets={buckets}
          accessor={(b) => b.revenueCents / 100}
          color="#f6b42c"
          format={(v) => `€ ${v.toFixed(0)}`}
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="kb-panel">
          <h2 className="kb-heading text-xl mb-4">Klustype breakdown</h2>
          {jobsByType.length === 0 ? (
            <p className="text-sm text-[#5c6878]">Geen data.</p>
          ) : (
            <ul className="space-y-3">
              {jobsByType.map((t) => {
                const total = jobsByType.reduce(
                  (s, x) => s + x._count._all,
                  0,
                );
                const pct = total > 0 ? (t._count._all / total) * 100 : 0;
                return (
                  <li key={t.type}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <p className="font-semibold text-sm">
                        {t.type === "PROJECT" ? "Projecten" : "Losse klussen"}
                      </p>
                      <p className="text-sm">
                        <span className="font-bold">{t._count._all}</span>
                        <span className="text-xs text-[#5c6878] ml-1.5">
                          ({pct.toFixed(0)}%)
                        </span>
                      </p>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#eef2f7" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor:
                            t.type === "PROJECT" ? "#f6b42c" : "#3586b6",
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="kb-panel">
          <h2 className="kb-heading text-xl mb-4">Top 10 steden</h2>
          {jobsByCity.length === 0 ? (
            <p className="text-sm text-[#5c6878]">Geen data.</p>
          ) : (
            <ul className="space-y-2">
              {jobsByCity.map((c, i) => (
                <li
                  key={c.city}
                  className="flex items-center justify-between py-1.5"
                >
                  <p className="text-sm">
                    <span className="text-[#5c6878] tabular-nums mr-2">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="font-semibold">{c.city}</span>
                  </p>
                  <p className="font-bold text-sm tabular-nums">
                    {c._count._all}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: string;
  Icon: typeof BarChart3;
  accent: string;
}) {
  return (
    <div className="kb-panel !p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-[#5c6878] font-semibold">
          {label}
        </p>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <p className="kb-heading text-2xl">{value}</p>
    </div>
  );
}

function Sparkline({
  buckets,
  accessor,
  color,
  format,
}: {
  buckets: DayBucket[];
  accessor: (b: DayBucket) => number;
  color: string;
  format?: (v: number) => string;
}) {
  const values = buckets.map(accessor);
  const max = Math.max(...values, 1);
  const fmt = format ?? ((v: number) => v.toFixed(0));

  return (
    <div>
      <div className="flex items-end gap-1 h-32">
        {buckets.map((b, i) => {
          const v = values[i];
          const heightPct = (v / max) * 100;
          return (
            <div
              key={b.date}
              className="flex-1 flex flex-col items-center justify-end relative group"
            >
              <div
                className="w-full rounded-t-sm transition-opacity hover:opacity-80"
                style={{
                  height: `${Math.max(heightPct, v > 0 ? 4 : 1)}%`,
                  backgroundColor: v > 0 ? color : "#e2e8f0",
                  minHeight: "2px",
                }}
              />
              <div
                className="absolute bottom-full mb-1 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                style={{ backgroundColor: "#0f2535" }}
              >
                {fmt(v)}
                <span className="block opacity-70">{b.date.slice(5)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-[#5c6878] mt-2">
        <span>{buckets[0]?.date}</span>
        <span>vandaag</span>
      </div>
    </div>
  );
}
