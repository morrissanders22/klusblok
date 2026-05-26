import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Star,
  Navigation,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { expireStaleClaims, minutesLeft } from "@/lib/claims";
import { formatEuro, TIER_LABELS } from "@/lib/services";
import {
  confirmByContractor,
  confirmByConsumer,
} from "@/app/(portal)/jobs/[id]/actions";

export const dynamic = "force-dynamic";

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/login?next=/claims/${id}`);

  await expireStaleClaims();

  const claim = await prisma.jobClaim.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          consumer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          services: true,
          photos: { orderBy: { order: "asc" } },
        },
      },
      contractor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
        },
      },
      payment: true,
    },
  });
  if (!claim) notFound();

  const userId = session.user.id;
  const isContractor = claim.contractorId === userId;
  const isConsumer = claim.job.consumerId === userId;
  if (!isContractor && !isConsumer) redirect("/dashboard");

  if (claim.status === "PENDING_PAYMENT") {
    return (
      <div className="max-w-md mx-auto kb-panel text-center mt-10">
        <Clock size={36} className="mx-auto text-[#f6b42c] mb-4" />
        <h1 className="kb-heading text-2xl mb-2">
          Betaling nog niet voltooid
        </h1>
        <p className="text-[#5c6878] mb-5">
          Zodra de betaling binnen is verschijnen de contactgegevens hier.
        </p>
        {claim.payment && (
          <Link
            href={
              claim.payment.providerRef
                ? `/payments/${claim.payment.id}/return`
                : `/payments/${claim.payment.id}/dev-confirm`
            }
            className="btn-yellow"
          >
            Betaling afronden
          </Link>
        )}
      </div>
    );
  }

  const minsLeft = claim.expiresAt ? minutesLeft(claim.expiresAt) : 0;

  return (
    <article className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[#5c6878] hover:text-[#3586b6]"
      >
        <ArrowLeft size={14} /> Dashboard
      </Link>

      <header className="kb-panel">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="kb-eyebrow">Claim · {claim.id.slice(0, 8)}</p>
            <h1 className="kb-heading text-3xl mt-2">{claim.job.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="kb-badge kb-badge--blue">
                <MapPin size={11} /> {claim.job.city}
              </span>
              <span className="kb-badge kb-badge--gray">
                {TIER_LABELS[claim.job.tier]}
              </span>
              <span
                className={`kb-badge ${
                  claim.status === "ACTIVE"
                    ? "kb-badge--yellow"
                    : claim.status === "COMPLETED"
                      ? "kb-badge--green"
                      : claim.status === "EXPIRED"
                        ? "kb-badge--red"
                        : "kb-badge--gray"
                }`}
              >
                {claim.status === "ACTIVE"
                  ? "Actief"
                  : claim.status === "COMPLETED"
                    ? "Afgerond"
                    : claim.status === "EXPIRED"
                      ? "Verlopen"
                      : "Geannuleerd"}
              </span>
            </div>
          </div>
          <span className="kb-heading text-3xl text-[#3586b6]">
            {formatEuro(claim.priceCents)}
          </span>
        </div>
      </header>

      {claim.status === "ACTIVE" && claim.expiresAt && (
        <div
          className="rounded-xl border p-4 flex items-center gap-3"
          style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
        >
          <Clock size={20} className="text-[#92400e] flex-shrink-0" />
          <div>
            <p className="font-semibold text-[#92400e] text-sm">
              Claim-venster: nog {minsLeft} minuten
            </p>
            <p className="text-xs text-[#a16207]">
              Neem binnen 2 uur contact op, anders komt de lead weer
              beschikbaar voor andere klussers.
            </p>
          </div>
        </div>
      )}

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-4">Contactgegevens</h2>
        {isContractor ? (
          <>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <ContactRow
                Icon={Phone}
                label="Naam"
                value={claim.job.consumer.name}
              />
              <ContactRow
                Icon={Phone}
                label="Telefoon"
                value={claim.job.consumer.phone ?? "—"}
                href={`tel:${claim.job.consumer.phone}`}
              />
              <ContactRow
                Icon={Mail}
                label="E-mail"
                value={claim.job.consumer.email}
                href={`mailto:${claim.job.consumer.email}`}
              />
              <ContactRow
                Icon={MapPin}
                label="Adres"
                value={`${claim.job.address}, ${claim.job.postalCode} ${claim.job.city}`}
              />
            </dl>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${claim.job.address}, ${claim.job.postalCode} ${claim.job.city}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-yellow mt-5 inline-flex"
            >
              <Navigation size={16} /> Route in Google Maps
            </a>
          </>
        ) : (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <ContactRow
              Icon={Phone}
              label="Bedrijf"
              value={claim.contractor.companyName ?? claim.contractor.name}
            />
            <ContactRow
              Icon={Phone}
              label="Telefoon"
              value={claim.contractor.phone ?? "—"}
              href={`tel:${claim.contractor.phone}`}
            />
            <ContactRow
              Icon={Mail}
              label="E-mail"
              value={claim.contractor.email}
              href={`mailto:${claim.contractor.email}`}
            />
          </dl>
        )}
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-4">Klus details</h2>
        <p className="text-sm whitespace-pre-wrap text-[#1a2535]">
          {claim.job.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {claim.job.services.map((s) => (
            <span key={s.id} className="kb-badge kb-badge--gray">
              {s.service}
            </span>
          ))}
        </div>
        {claim.job.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
            {claim.job.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.url}
                alt=""
                className="aspect-square object-cover rounded-lg border border-[#e2e8f0]"
              />
            ))}
          </div>
        )}
      </section>

      {claim.status === "ACTIVE" && (
        <section className="kb-panel">
          <h2 className="kb-heading text-xl mb-1">Klus aangenomen?</h2>
          <p className="text-sm text-[#5c6878] mb-5">
            Zodra beide partijen bevestigen wordt de klus afgerond en kan er
            een review worden geschreven.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <ConfirmCard
              role="Aannemer"
              confirmed={!!claim.contractorConfirmedAt}
            />
            <ConfirmCard
              role="Particulier"
              confirmed={!!claim.consumerConfirmedAt}
            />
          </div>
          {isContractor && !claim.contractorConfirmedAt && (
            <form
              action={async () => {
                "use server";
                await confirmByContractor(claim.id);
              }}
            >
              <button type="submit" className="btn-yellow">
                <CheckCircle2 size={16} /> Ik bevestig de klus
              </button>
            </form>
          )}
          {isConsumer && !claim.consumerConfirmedAt && (
            <form
              action={async () => {
                "use server";
                await confirmByConsumer(claim.id);
              }}
            >
              <button type="submit" className="btn-yellow">
                <CheckCircle2 size={16} /> Ik bevestig de klus
              </button>
            </form>
          )}
        </section>
      )}

      {claim.status === "COMPLETED" && isConsumer && (
        <section
          className="rounded-xl border p-6 flex items-center justify-between gap-4 flex-wrap"
          style={{ backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }}
        >
          <div>
            <p className="font-bold text-[#065f46]">Klus afgerond!</p>
            <p className="text-sm text-[#047857]">
              Bedankt voor je gebruik van Klusblok. Laat een review achter
              voor de klusser.
            </p>
          </div>
          <Link
            href={`/reviews/new?claim=${claim.id}`}
            className="btn-yellow whitespace-nowrap"
          >
            <Star size={16} /> Schrijf review
          </Link>
        </section>
      )}
    </article>
  );
}

function ContactRow({
  Icon,
  label,
  value,
  href,
}: {
  Icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#f1f5f9", color: "#3586b6" }}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#5c6878] uppercase tracking-wider">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            className="font-medium text-[#1a2535] hover:text-[#3586b6] block truncate"
          >
            {value}
          </a>
        ) : (
          <p className="font-medium text-[#1a2535] truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function ConfirmCard({
  role,
  confirmed,
}: {
  role: string;
  confirmed: boolean;
}) {
  return (
    <div
      className="rounded-lg border p-4 flex items-center gap-3"
      style={{
        borderColor: confirmed ? "#a7f3d0" : "#e2e8f0",
        backgroundColor: confirmed ? "#ecfdf5" : "#fff",
      }}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          confirmed ? "" : "border-2 border-dashed border-[#cbd5e1]"
        }`}
        style={{
          backgroundColor: confirmed ? "#10b981" : "transparent",
          color: confirmed ? "white" : "#9aa6b5",
        }}
      >
        {confirmed ? <CheckCircle2 size={18} /> : null}
      </div>
      <div>
        <p className="font-semibold text-sm">{role}</p>
        <p className="text-xs text-[#5c6878]">
          {confirmed ? "Bevestigd" : "Wacht op bevestiging"}
        </p>
      </div>
    </div>
  );
}
