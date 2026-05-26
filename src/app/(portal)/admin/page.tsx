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
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalConsumers,
    totalContractors,
    totalJobs,
    openJobs,
    completedJobs,
    paidThisMonth,
    paidAll,
    recentClaims,
    recentSignups,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CONSUMER" } }),
    prisma.user.count({ where: { role: "CONTRACTOR" } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amountCents: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amountCents: true },
    }),
    prisma.jobClaim.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        job: { select: { title: true, city: true } },
        contractor: { select: { companyName: true, name: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        createdAt: true,
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
          Real-time inzicht in omzet, gebruikers en activiteit.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <BigStat
          label="Omzet deze maand"
          value={formatEuro(paidThisMonth._sum.amountCents ?? 0)}
          Icon={TrendingUp}
          accent="#f6b42c"
        />
        <BigStat
          label="Omzet totaal"
          value={formatEuro(paidAll._sum.amountCents ?? 0)}
          Icon={Wallet}
          accent="#3586b6"
        />
        <BigStat
          label="Particulieren"
          value={totalConsumers.toString()}
          Icon={Users}
          accent="#10b981"
        />
        <BigStat
          label="Aannemers"
          value={totalContractors.toString()}
          Icon={Hammer}
          accent="#1e4f70"
        />
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <SmallStat label="Klussen totaal" value={totalJobs} Icon={Briefcase} />
        <SmallStat label="Open klussen" value={openJobs} Icon={Clock} />
        <SmallStat
          label="Afgerond"
          value={completedJobs}
          Icon={CheckCircle2}
        />
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="kb-panel">
          <div className="flex items-center justify-between mb-5">
            <h2 className="kb-heading text-xl">Recente claims</h2>
            <span className="text-xs text-[#5c6878] uppercase tracking-wider">
              Laatste 10
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
              Laatste 10
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
  Icon,
  accent,
}: {
  label: string;
  value: string;
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
        <p className="kb-heading text-3xl">{value}</p>
      </div>
    </div>
  );
}

function SmallStat({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number;
  Icon: typeof Briefcase;
}) {
  return (
    <div className="kb-panel !p-4 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-[#5c6878] font-semibold">
          {label}
        </p>
        <p className="kb-heading text-2xl mt-1">{value}</p>
      </div>
      <Icon size={20} className="text-[#9aa6b5]" />
    </div>
  );
}
