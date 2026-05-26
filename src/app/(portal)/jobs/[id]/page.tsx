import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, Tag, Hammer, LogIn } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { expireStaleClaims, minutesLeft } from "@/lib/claims";
import { TIER_LABELS } from "@/lib/services";
import { getCapabilities } from "@/lib/mode";
import { ClaimModal } from "./ClaimModal";
import { PhotoGallery } from "./PhotoGallery";
import { cancelJob } from "./actions";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ claim?: string }>;
}) {
  const { id } = await params;
  const { claim: claimParam } = await searchParams;
  const autoOpenClaim = claimParam === "open";
  await expireStaleClaims(id);

  const session = await auth();

  const [job, me] = await Promise.all([
    prisma.job.findUnique({
      where: { id },
      include: {
        consumer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        services: true,
        photos: { orderBy: { order: "asc" } },
        claims: {
          where: { status: { in: ["PENDING_PAYMENT", "ACTIVE", "COMPLETED"] } },
          include: {
            contractor: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                companyName: true,
              },
            },
          },
        },
      },
    }),
    session?.user
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { kvkNumber: true, hasLiabilityInsurance: true },
        })
      : Promise.resolve(null),
  ]);

  if (!job) notFound();

  const isOwner = session?.user?.id === job.consumer.id;
  const caps = me ? getCapabilities(me) : null;
  const activeClaim = job.claims.find(
    (c) => c.status === "ACTIVE" || c.status === "PENDING_PAYMENT",
  );
  const myActiveClaim =
    session?.user?.id
      ? job.claims.find(
          (c) =>
            c.contractorId === session.user.id &&
            (c.status === "ACTIVE" || c.status === "PENDING_PAYMENT"),
        )
      : null;

  const statusBadge =
    job.status === "OPEN" ? (
      <span className="kb-badge kb-badge--green">Open</span>
    ) : job.status === "CLAIMED" ? (
      <span className="kb-badge kb-badge--yellow">Geclaimd</span>
    ) : job.status === "COMPLETED" ? (
      <span className="kb-badge kb-badge--gray">Afgerond</span>
    ) : (
      <span className="kb-badge kb-badge--red">Geannuleerd</span>
    );

  return (
    <article className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm text-[#5c6878] hover:text-[#3586b6]"
      >
        <ArrowLeft size={14} /> Alle klussen
      </Link>

      <header className="kb-panel">
        <p className="kb-eyebrow">{TIER_LABELS[job.tier]}</p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">{job.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="kb-badge kb-badge--blue">
            <MapPin size={11} /> {job.city}
          </span>
          <span className="kb-badge kb-badge--gray">
            <Calendar size={11} />{" "}
            {new Date(job.createdAt).toLocaleDateString("nl-NL")}
          </span>
          {statusBadge}
        </div>
      </header>

      <PhotoGallery photos={job.photos} />

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-3">Beschrijving</h2>
        <p className="whitespace-pre-wrap text-[#1a2535] leading-relaxed">
          {job.description}
        </p>
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-3 flex items-center gap-2">
          <Tag size={18} /> Diensten
        </h2>
        <div className="flex flex-wrap gap-2">
          {job.services.map((s) => (
            <span key={s.id} className="kb-badge kb-badge--gray">
              {s.service}
            </span>
          ))}
        </div>
      </section>

      {/* Owner view */}
      {isOwner && (
        <section className="kb-panel">
          <h2 className="kb-heading text-xl mb-3">Status van je klus</h2>
          {activeClaim && activeClaim.status === "ACTIVE" ? (
            <div className="space-y-3">
              <p className="text-[#1a2535]">
                <strong>
                  {activeClaim.contractor.companyName ??
                    activeClaim.contractor.name}
                </strong>{" "}
                heeft je klus geclaimd. Telefoon:{" "}
                <a
                  href={`tel:${activeClaim.contractor.phone}`}
                  className="text-[#3586b6] font-semibold hover:underline"
                >
                  {activeClaim.contractor.phone}
                </a>
              </p>
              <p className="text-sm text-[#5c6878]">
                Nog {minutesLeft(activeClaim.expiresAt!)} minuten in het
                claim-venster.
              </p>
              <Link
                href={`/claims/${activeClaim.id}`}
                className="btn-yellow inline-flex"
              >
                Naar claim-detail →
              </Link>
            </div>
          ) : job.status === "OPEN" ? (
            <p className="text-[#5c6878]">
              Nog niet geclaimd. Je krijgt een melding zodra een klusser je
              klus oppakt.
            </p>
          ) : job.status === "COMPLETED" ? (
            <p className="text-[#5c6878]">
              Klus is afgerond. Laat een review achter via je dashboard.
            </p>
          ) : (
            <p className="text-[#5c6878]">
              Status: {job.status.toLowerCase()}.
            </p>
          )}

          {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
            <form
              action={async () => {
                "use server";
                await cancelJob(job.id);
              }}
              className="mt-4"
            >
              <button
                type="submit"
                className="text-sm rounded-md border px-3 py-1.5 hover:bg-neutral-50"
                style={{ borderColor: "#dde4ed" }}
              >
                Klus annuleren
              </button>
            </form>
          )}
        </section>
      )}

      {/* Non-owner actions */}
      {!isOwner && (
        <section className="kb-panel">
          {myActiveClaim ? (
            <Link
              href={`/claims/${myActiveClaim.id}`}
              className="btn-yellow inline-flex"
            >
              Ga naar je actieve claim →
            </Link>
          ) : job.status !== "OPEN" ? (
            <p className="text-[#5c6878]">
              Deze klus is al door een andere klusser geclaimd.
            </p>
          ) : !session?.user ? (
            // Logged out — invite to sign in as klusser
            <ReactCTA
              title="Reageer op deze klus"
              description="Log in als klusser of registreer je zakelijk account om deze klus direct te claimen."
              href={`/login/klusser?next=/jobs/${job.id}`}
              ctaLabel="Reageer als klusser"
              Icon={LogIn}
            />
          ) : caps?.canClaim ? (
            // Has KVK + insurance — show claim modal
            <ClaimModal
              jobId={job.id}
              jobTitle={job.title}
              city={job.city}
              tierLabel={TIER_LABELS[job.tier]}
              priceCents={job.priceCents}
              autoOpen={autoOpenClaim}
            />
          ) : (
            // Logged in but no klusser-capability — invite to upgrade
            <ReactCTA
              title="Reageer op deze klus"
              description="Vul je KVK-gegevens in en activeer klusser-modus om deze klus te claimen."
              href={`/word-klusser?next=/jobs/${job.id}`}
              ctaLabel="Word klusser"
              Icon={Hammer}
            />
          )}
        </section>
      )}
    </article>
  );
}

function ReactCTA({
  title,
  description,
  href,
  ctaLabel,
  Icon,
}: {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  Icon: typeof LogIn;
}) {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
      >
        <Icon size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1a2535]">{title}</p>
        <p className="text-sm text-[#5c6878]">{description}</p>
      </div>
      <Link href={href} className="btn-yellow">
        {ctaLabel}
      </Link>
    </div>
  );
}
