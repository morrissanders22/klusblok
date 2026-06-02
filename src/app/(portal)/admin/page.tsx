import { redirect } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  Users,
  Hammer,
  Briefcase,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Activity,
  Mail,
  Layers,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/services";
import { getAdminStats, formatDuration } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [stats, recentClaims, recentSignups] = await Promise.all([
    getAdminStats(),
    prisma.jobClaim.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        job: { select: { title: true, city: true } },
        contractor: { select: { companyName: true, name: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        createdAt: true,
        emailVerified: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <p className="kb-eyebrow flex items-center gap-2">
          <ShieldCheck size={12} /> Admin
        </p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Platform overzicht
        </h1>
        <p className="text-[#5c6878] mt-2">
          Real-time inzicht in omzet, gebruikers, klussen en conversie.
        </p>
      </header>

      {/* Top KPIs */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat
          label="Omzet deze maand"
          value={formatEuro(stats.payments.thisMonthCents)}
          sublabel={`Week: ${formatEuro(stats.payments.weekCents)}`}
          Icon={TrendingUp}
          accent="#f7c021"
        />
        <BigStat
          label="Omzet totaal"
          value={formatEuro(stats.payments.totalRevenueCents)}
          sublabel={`${stats.payments.count} betaalde claims`}
          Icon={Wallet}
          accent="#3586b6"
        />
        <BigStat
          label="Aanmeldingen totaal"
          value={stats.signups.total.toString()}
          sublabel={`+${stats.signups.month} deze maand · +${stats.signups.week} deze week`}
          Icon={Users}
          accent="#10b981"
        />
        <BigStat
          label="Klussen totaal"
          value={stats.jobs.total.toString()}
          sublabel={`${stats.jobs.singles} los · ${stats.jobs.projects} projecten`}
          Icon={Briefcase}
          accent="#1e4f70"
        />
      </section>

      {/* User breakdown */}
      <section>
        <h2 className="kb-heading text-xl mb-3">Gebruikers</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <SmallStat label="Particulieren" value={stats.users.consumers} Icon={Users} />
          <SmallStat label="Klussers" value={stats.users.contractors} Icon={Hammer} />
          <SmallStat label="Admins" value={stats.users.admins} Icon={ShieldCheck} />
          <SmallStat label="Geverifieerd" value={stats.users.verified} Icon={CheckCircle2} tone="green" />
          <SmallStat label="Wacht op verificatie" value={stats.users.unverified} Icon={Mail} tone="yellow" />
        </div>
      </section>

      {/* Active accounts */}
      <section>
        <h2 className="kb-heading text-xl mb-3">Actief in de laatste 30 dagen</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <SmallStat
            label="Klussers met activiteit"
            value={stats.active.contractorsLast30d}
            Icon={Activity}
          />
          <SmallStat
            label="Particulieren met activiteit"
            value={stats.active.consumersLast30d}
            Icon={Activity}
          />
        </div>
      </section>

      {/* Job + claim funnel */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="kb-panel">
          <h2 className="kb-heading text-xl mb-4">Klussen funnel</h2>
          <FunnelRow label="Totaal geplaatst" count={stats.jobs.total} pct={100} />
          <FunnelRow
            label="Geclaimd"
            count={stats.funnels.jobsClaimed}
            pct={stats.funnels.claimConversion}
            highlight
          />
          <FunnelRow
            label="Afgerond"
            count={stats.funnels.jobsCompleted}
            pct={stats.funnels.completionRate}
            highlight
          />
          <FunnelRow label="Open op dit moment" count={stats.jobs.open} />
          <FunnelRow label="Geannuleerd" count={stats.jobs.cancelled} dim />
        </div>

        <div className="kb-panel">
          <h2 className="kb-heading text-xl mb-4">Claims status</h2>
          <FunnelRow label="Actief" count={stats.claims.active} pct={100} highlight />
          <FunnelRow label="Wacht op betaling" count={stats.claims.pending} />
          <FunnelRow label="Afgerond" count={stats.claims.completed} highlight />
          <FunnelRow label="Verlopen (2u venster)" count={stats.claims.expired} dim />
          <FunnelRow label="Totaal alle tijden" count={stats.claims.total} />
        </div>
      </section>

      {/* Performance timings + reviews */}
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="kb-panel">
          <p className="kb-eyebrow flex items-center gap-2">
            <Clock size={12} /> Gem. tijd tot claim
          </p>
          <p className="kb-heading text-3xl mt-2">
            {formatDuration(stats.timing.avgTimeToClaimMs)}
          </p>
          <p className="text-xs text-[#5c6878] mt-1">
            Vanaf klus geplaatst tot betaalde claim.
          </p>
        </div>
        <div className="kb-panel">
          <p className="kb-eyebrow flex items-center gap-2">
            <Layers size={12} /> Gem. afrondtijd
          </p>
          <p className="kb-heading text-3xl mt-2">
            {formatDuration(stats.timing.avgTimeToCompletionMs)}
          </p>
          <p className="text-xs text-[#5c6878] mt-1">
            Vanaf claim tot beide partijen bevestigden.
          </p>
        </div>
        <div className="kb-panel">
          <p className="kb-eyebrow flex items-center gap-2">
            <Star size={12} /> Reviews
          </p>
          <p className="kb-heading text-3xl mt-2">
            {stats.reviews.avgRating.toFixed(1)}{" "}
            <span className="text-base text-[#5c6878] font-normal">
              ({stats.reviews.count})
            </span>
          </p>
          <p className="text-xs text-[#5c6878] mt-1">
            Gemiddelde sterrenscore over alle reviews.
          </p>
        </div>
      </section>

      {/* Recent activity */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="kb-panel">
          <div className="flex items-center justify-between mb-5">
            <h2 className="kb-heading text-xl">Recente claims</h2>
            <span className="text-xs text-[#5c6878] uppercase tracking-wider">
              Laatste 8
            </span>
          </div>
          {recentClaims.length === 0 ? (
            <p className="text-[#5c6878] text-sm text-center py-6">
              Nog geen activiteit.
            </p>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {recentClaims.map((c) => (
                <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-[#1a2535] truncate">
                        {c.job.title}
                      </p>
                      <p className="text-xs text-[#5c6878] mt-0.5">
                        {c.contractor.companyName ?? c.contractor.name} ·{" "}
                        {c.job.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`kb-badge ${
                          c.status === "ACTIVE"
                            ? "kb-badge--blue"
                            : c.status === "COMPLETED"
                              ? "kb-badge--green"
                              : c.status === "PENDING_PAYMENT"
                                ? "kb-badge--yellow"
                                : c.status === "EXPIRED"
                                  ? "kb-badge--red"
                                  : "kb-badge--gray"
                        }`}
                      >
                        {c.status.toLowerCase().replace("_", " ")}
                      </span>
                      <span className="font-bold text-sm tabular-nums">
                        {formatEuro(c.priceCents)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="kb-panel">
          <div className="flex items-center justify-between mb-5">
            <h2 className="kb-heading text-xl">Recente aanmeldingen</h2>
            <span className="text-xs text-[#5c6878] uppercase tracking-wider">
              Laatste 8
            </span>
          </div>
          {recentSignups.length === 0 ? (
            <p className="text-[#5c6878] text-sm text-center py-6">
              Nog geen aanmeldingen.
            </p>
          ) : (
            <ul className="divide-y divide-[#eef2f7]">
              {recentSignups.map((u) => (
                <li key={u.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-[#1a2535] truncate">
                        {u.companyName ?? u.name}
                      </p>
                      <p className="text-xs text-[#5c6878] mt-0.5 truncate">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!u.emailVerified && (
                        <span className="kb-badge kb-badge--yellow text-[10px]">
                          Wacht
                        </span>
                      )}
                      <span
                        className={`kb-badge ${
                          u.role === "CONTRACTOR"
                            ? "kb-badge--blue"
                            : u.role === "ADMIN"
                              ? "kb-badge--yellow"
                              : "kb-badge--gray"
                        }`}
                      >
                        {u.role.toLowerCase()}
                      </span>
                      <span className="text-xs text-[#5c6878] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("nl-NL")}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function BigStat({
  label,
  value,
  sublabel,
  Icon,
  accent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  Icon: typeof Wallet;
  accent: string;
}) {
  return (
    <div className="kb-panel !p-5 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10"
        style={{ backgroundColor: accent }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-[#5c6878] font-semibold">
            {label}
          </p>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <p className="kb-heading text-2xl">{value}</p>
        {sublabel && (
          <p className="text-xs text-[#5c6878] mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

function SmallStat({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: number;
  Icon: typeof Briefcase;
  tone?: "green" | "yellow";
}) {
  const color =
    tone === "green" ? "#10b981" : tone === "yellow" ? "#f7c021" : "#9aa6b5";
  return (
    <div className="kb-panel !p-4 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#5c6878] font-semibold">
          {label}
        </p>
        <p className="kb-heading text-2xl mt-1">{value}</p>
      </div>
      <Icon size={20} style={{ color }} />
    </div>
  );
}

function FunnelRow({
  label,
  count,
  pct,
  highlight = false,
  dim = false,
}: {
  label: string;
  count: number;
  pct?: number;
  highlight?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="py-2.5 first:pt-0 last:pb-0" style={dim ? { opacity: 0.6 } : undefined}>
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-sm font-medium text-[#1a2535]">{label}</p>
        <p className="font-bold text-[#1a2535] tabular-nums">
          {count}
          {pct !== undefined && (
            <span className="text-xs font-normal text-[#5c6878] ml-1.5">
              ({pct.toFixed(0)}%)
            </span>
          )}
        </p>
      </div>
      {pct !== undefined && (
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "#eef2f7" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, pct)}%`,
              backgroundColor: highlight ? "#f7c021" : "#3586b6",
            }}
          />
        </div>
      )}
    </div>
  );
}
