import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Hammer } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/services";
import { EditUserForm } from "./EditUserForm";
import { DeleteUserButton } from "./DeleteUserButton";
import { ImpersonateButton } from "./ImpersonateButton";

export const dynamic = "force-dynamic";

export default async function AdminUserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const isSelf = session.user.id === id;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { jobs: true, claims: true, reviewsReceived: true } },
      claims: {
        select: {
          priceCents: true,
          status: true,
        },
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
      },
    },
  });
  if (!user) notFound();

  const totalSpent = user.claims.reduce((s, c) => s + c.priceCents, 0);
  const backHref =
    user.role === "CONTRACTOR"
      ? "/admin/klanten/klussers"
      : "/admin/klanten/kluszoekers";

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-[#5c6878] hover:text-[#3586b6]"
      >
        <ArrowLeft size={14} /> Klantenoverzicht
      </Link>

      <header className="kb-panel">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <p className="kb-eyebrow">
              {user.role === "CONTRACTOR"
                ? "Klusser"
                : user.role === "ADMIN"
                  ? "Admin"
                  : "Kluszoeker"}
            </p>
            <h1 className="kb-heading text-3xl mt-2">
              {user.companyName ?? user.name}
            </h1>
            {user.companyName && user.companyName !== user.name && (
              <p className="text-sm text-[#5c6878] mt-1">
                Contactpersoon: {user.name}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="kb-badge kb-badge--gray">
                <Mail size={11} /> {user.email}
              </span>
              {user.phone && (
                <span className="kb-badge kb-badge--gray">
                  <Phone size={11} /> {user.phone}
                </span>
              )}
              {user.city && (
                <span className="kb-badge kb-badge--blue">
                  <MapPin size={11} /> {user.city}
                </span>
              )}
              <span className="kb-badge kb-badge--gray">
                <Calendar size={11} />{" "}
                {new Date(user.createdAt).toLocaleDateString("nl-NL")}
              </span>
              {user.emailVerified ? (
                <span className="kb-badge kb-badge--green">Geverifieerd</span>
              ) : (
                <span className="kb-badge kb-badge--yellow">
                  Wacht op verificatie
                </span>
              )}
              {user.role === "CONTRACTOR" && user.hasLiabilityInsurance && (
                <span className="kb-badge kb-badge--green">Verzekerd</span>
              )}
            </div>
          </div>
          {!isSelf && (
            <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
              <ImpersonateButton
                userId={user.id}
                label={user.companyName ?? user.name}
              />
              <DeleteUserButton
                userId={user.id}
                name={user.companyName ?? user.name}
              />
            </div>
          )}
        </div>
      </header>

      <section className="grid sm:grid-cols-3 gap-4">
        {user.role === "CONTRACTOR" ? (
          <>
            <StatCard
              label="Geclaimde klussen"
              value={user._count.claims}
              Icon={Briefcase}
            />
            <StatCard
              label="Uitgegeven aan leads"
              value={formatEuro(totalSpent)}
              Icon={Hammer}
            />
            <StatCard
              label="Reviews ontvangen"
              value={user._count.reviewsReceived}
              Icon={Briefcase}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Klussen geplaatst"
              value={user._count.jobs}
              Icon={Briefcase}
            />
            <StatCard label="Reviews geschreven" value={0} Icon={Briefcase} />
            <div />
          </>
        )}
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-4">Gegevens bewerken</h2>
        <EditUserForm
          userId={user.id}
          defaults={{
            name: user.name,
            phone: user.phone ?? "",
            role: user.role,
            city: user.city ?? "",
            companyName: user.companyName ?? "",
            kvkNumber: user.kvkNumber ?? "",
            hasLiabilityInsurance: user.hasLiabilityInsurance,
          }}
        />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  Icon,
}: {
  label: string;
  value: number | string;
  Icon: typeof Briefcase;
}) {
  return (
    <div className="kb-panel !p-5 flex items-center justify-between">
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
