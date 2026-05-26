import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Briefcase, ListChecks, Wallet, Clock, Star } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { expireStaleClaims, minutesLeft } from "@/lib/claims";
import { formatEuro } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!me) redirect("/login");

  await expireStaleClaims();

  if (me.role === "CONTRACTOR") {
    return (
      <ContractorDashboard userId={session.user.id} name={session.user.name} />
    );
  }
  return (
    <ConsumerDashboard userId={session.user.id} name={session.user.name} />
  );
}

async function ConsumerDashboard({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const jobs = await prisma.job.findMany({
    where: { consumerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      claims: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        include: {
          contractor: { select: { name: true, companyName: true } },
        },
      },
      review: { select: { id: true } },
    },
  });

  const openCount = jobs.filter((j) => j.status === "OPEN").length;
  const claimedCount = jobs.filter((j) => j.status === "CLAIMED").length;
  const completedCount = jobs.filter((j) => j.status === "COMPLETED").length;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kb-eyebrow">Dashboard</p>
          <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
            Welkom terug, {name}
          </h1>
          <p className="text-[#5c6878] mt-2">
            Beheer hier je geplaatste klussen en je actieve leads.
          </p>
        </div>
        <Link href="/jobs/new" className="btn-yellow">
          <Plus size={16} /> Nieuwe klus
        </Link>
      </header>

      <section className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Wachten op klusser"
          value={openCount.toString()}
          Icon={Clock}
          tone="yellow"
        />
        <StatCard
          label="Geclaimd"
          value={claimedCount.toString()}
          Icon={Briefcase}
          tone="blue"
        />
        <StatCard
          label="Afgerond"
          value={completedCount.toString()}
          Icon={ListChecks}
          tone="green"
        />
      </section>

      <section className="kb-panel">
        <div className="flex items-center justify-between mb-5">
          <h2 className="kb-heading text-xl">Mijn klussen</h2>
          <span className="text-sm text-[#5c6878]">{jobs.length} totaal</span>
        </div>
        {jobs.length === 0 ? (
          <EmptyState
            title="Nog geen klussen geplaatst"
            description="Plaats je eerste klus en ontvang reacties van vakmensen."
            ctaHref="/jobs/new"
            ctaLabel="Plaats een klus"
          />
        ) : (
          <ul className="divide-y divide-[#eef2f7]">
            {jobs.map((job) => {
              const active = job.claims.find((c) => c.status === "ACTIVE");
              const completed = job.claims.find(
                (c) => c.status === "COMPLETED",
              );
              const statusBadge =
                job.status === "OPEN" ? (
                  <span className="kb-badge kb-badge--yellow">
                    Wacht op klusser
                  </span>
                ) : active ? (
                  <span className="kb-badge kb-badge--blue">
                    Geclaimd · nog {minutesLeft(active.expiresAt!)} min
                  </span>
                ) : completed ? (
                  <span className="kb-badge kb-badge--green">Afgerond</span>
                ) : job.status === "CANCELLED" ? (
                  <span className="kb-badge kb-badge--gray">Geannuleerd</span>
                ) : (
                  <span className="kb-badge kb-badge--gray">
                    {job.status.toLowerCase()}
                  </span>
                );
              return (
                <li key={job.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="flex-1 min-w-0 hover:text-[#3586b6] transition-colors"
                    >
                      <p className="font-semibold text-[#1a2535] truncate">
                        {job.title}
                      </p>
                      <p className="text-sm text-[#5c6878] mt-1">
                        {job.city} ·{" "}
                        {new Date(job.createdAt).toLocaleDateString("nl-NL")}
                      </p>
                    </Link>
                    <div className="flex items-center gap-3">
                      {statusBadge}
                      {active && (
                        <Link
                          href={`/claims/${active.id}`}
                          className="text-xs font-bold text-[#3586b6] hover:underline"
                        >
                          Bevestigen →
                        </Link>
                      )}
                      {completed && !job.review && (
                        <Link
                          href={`/reviews/new?claim=${completed.id}`}
                          className="text-xs font-bold text-[#f6b42c] hover:underline flex items-center gap-1"
                        >
                          <Star size={12} /> Review →
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

async function ContractorDashboard({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [claims, openJobsList, openJobsCount, activeClaims, completedClaims] =
    await Promise.all([
      prisma.jobClaim.findMany({
        where: { contractorId: userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          job: {
            select: { id: true, title: true, city: true, status: true },
          },
        },
      }),
      prisma.job.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          services: { take: 2 },
          photos: { orderBy: { order: "asc" }, take: 1 },
        },
      }),
      prisma.job.count({ where: { status: "OPEN" } }),
      prisma.jobClaim.count({
        where: { contractorId: userId, status: "ACTIVE" },
      }),
      prisma.jobClaim.count({
        where: { contractorId: userId, status: "COMPLETED" },
      }),
    ]);

  const totalSpent = claims
    .filter((c) => c.status === "ACTIVE" || c.status === "COMPLETED")
    .reduce((sum, c) => sum + c.priceCents, 0);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kb-eyebrow">Dashboard</p>
          <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
            Welkom terug, {name}
          </h1>
          <p className="text-[#5c6878] mt-2">
            Bekijk open klussen en je actieve leads.
          </p>
        </div>
        <Link href="/jobs" className="btn-dark">
          <Briefcase size={16} /> Vind klussen
        </Link>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open klussen"
          value={openJobsCount.toString()}
          Icon={Briefcase}
          tone="yellow"
        />
        <StatCard
          label="Mijn actieve leads"
          value={activeClaims.toString()}
          Icon={Clock}
          tone="blue"
        />
        <StatCard
          label="Afgeronde klussen"
          value={completedClaims.toString()}
          Icon={ListChecks}
          tone="green"
        />
        <StatCard
          label="Uitgegeven aan leads"
          value={formatEuro(totalSpent)}
          Icon={Wallet}
          tone="navy"
        />
      </section>

      <section id="open-klussen" className="kb-panel">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="kb-heading text-xl">Open klussen om op te reageren</h2>
            <p className="text-sm text-[#5c6878] mt-1">
              Klik op een klus voor details + reageer-knop.
            </p>
          </div>
          <Link
            href="/jobs"
            className="text-sm font-bold text-[#3586b6] hover:underline"
          >
            Bekijk alle ({openJobsCount}) →
          </Link>
        </div>
        {openJobsList.length === 0 ? (
          <p className="text-[#5c6878] text-sm text-center py-6">
            Geen open klussen in je regio.
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {openJobsList.map((job) => (
              <li key={job.id}>
                <Link
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl overflow-hidden border hover:border-[#3586b6] transition-colors"
                  style={{ borderColor: "#e2e8f0" }}
                >
                  <div className="aspect-[16/10] bg-[#f1f5f9] overflow-hidden">
                    {job.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={job.photos[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#cbd5e1] text-[10px] uppercase tracking-wider">
                        Geen foto
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {job.services.map((s) => (
                        <span
                          key={s.id}
                          className="kb-badge kb-badge--blue text-[10px]"
                        >
                          {s.service}
                        </span>
                      ))}
                    </div>
                    <p className="font-bold text-sm text-[#1a2535] line-clamp-1">
                      {job.title}
                    </p>
                    <p className="text-xs text-[#5c6878] mt-1.5">{job.city}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="leads" className="kb-panel">
        <div className="flex items-center justify-between mb-5">
          <h2 className="kb-heading text-xl">Mijn claims</h2>
          <Link
            href="/jobs"
            className="text-sm font-bold text-[#3586b6] hover:underline"
          >
            Vind meer klussen →
          </Link>
        </div>
        {claims.length === 0 ? (
          <EmptyState
            title="Nog geen klussen geclaimd"
            description="Bekijk open klussen in je regio en claim je eerste lead."
            ctaHref="/jobs"
            ctaLabel="Vind klussen"
          />
        ) : (
          <ul className="divide-y divide-[#eef2f7]">
            {claims.map((claim) => {
              const status =
                claim.status === "ACTIVE" ? (
                  <span className="kb-badge kb-badge--blue">
                    Actief · nog {minutesLeft(claim.expiresAt!)} min
                  </span>
                ) : claim.status === "PENDING_PAYMENT" ? (
                  <span className="kb-badge kb-badge--yellow">
                    Wacht op betaling
                  </span>
                ) : claim.status === "COMPLETED" ? (
                  <span className="kb-badge kb-badge--green">Afgerond</span>
                ) : claim.status === "EXPIRED" ? (
                  <span className="kb-badge kb-badge--red">Verlopen</span>
                ) : (
                  <span className="kb-badge kb-badge--gray">Geannuleerd</span>
                );
              return (
                <li key={claim.id} className="py-4 first:pt-0 last:pb-0">
                  <Link
                    href={`/claims/${claim.id}`}
                    className="flex items-center justify-between gap-4 flex-wrap hover:text-[#3586b6] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1a2535] truncate">
                        {claim.job.title}
                      </p>
                      <p className="text-sm text-[#5c6878] mt-1">
                        {claim.job.city} ·{" "}
                        {new Date(claim.createdAt).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">{status}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

type Tone = "yellow" | "blue" | "green" | "navy";

const TONE_BG: Record<Tone, string> = {
  yellow: "#fef3c7",
  blue: "#dbeafe",
  green: "#d1fae5",
  navy: "#e2e8f0",
};
const TONE_FG: Record<Tone, string> = {
  yellow: "#92400e",
  blue: "#1e40af",
  green: "#065f46",
  navy: "#0f2535",
};

function StatCard({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  Icon: typeof Briefcase;
  tone: Tone;
}) {
  return (
    <div className="kb-panel !p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-[#5c6878] font-semibold">
          {label}
        </p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: TONE_BG[tone], color: TONE_FG[tone] }}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="kb-heading text-3xl">{value}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="text-center py-10">
      <p className="kb-heading text-xl mb-2">{title}</p>
      <p className="text-[#5c6878] text-sm mb-5">{description}</p>
      <Link href={ctaHref} className="btn-yellow">
        {ctaLabel}
      </Link>
    </div>
  );
}
