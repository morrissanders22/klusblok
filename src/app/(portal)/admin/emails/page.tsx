import { redirect } from "next/navigation";
import { Mail, Send, AlertCircle } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  // For now, derive sent emails from data: verification, claim notifications, reviews etc.
  // We don't have a dedicated EmailLog table yet — show usage stats instead.
  const [
    pendingVerify,
    totalUsers,
    completedClaims,
    activeClaims,
  ] = await Promise.all([
    prisma.user.count({ where: { emailVerified: null, verifyToken: { not: null } } }),
    prisma.user.count(),
    prisma.jobClaim.count({ where: { status: "COMPLETED" } }),
    prisma.jobClaim.count({ where: { status: "ACTIVE" } }),
  ]);

  // Estimate sent emails based on flows:
  // - verify: 1 per user signup (= totalUsers)
  // - claim contact: 1 to contractor + 1 to consumer per active/completed claim
  // - review prompt: 1 per completed claim
  const verifyMails = totalUsers;
  const claimMails = (activeClaims + completedClaims) * 2;
  const reviewMails = completedClaims;
  const totalSent = verifyMails + claimMails + reviewMails;

  const isProductionMail = !!process.env.RESEND_API_KEY || !!process.env.SMTP_HOST;

  return (
    <div className="space-y-8">
      <header>
        <p className="kb-eyebrow flex items-center gap-2">
          <Mail size={12} /> E-mails
        </p>
        <h1 className="kb-heading text-3xl mt-2">
          E-mail uitsluitingen & log
        </h1>
        <p className="text-[#5c6878] mt-2">
          Statistieken van uitgaande mails en de mailprovider-configuratie.
        </p>
      </header>

      {!isProductionMail && (
        <div
          className="rounded-xl border p-4 flex items-center gap-3"
          style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
        >
          <AlertCircle size={18} className="text-[#92400e] flex-shrink-0" />
          <div className="flex-1 text-sm">
            <p className="font-bold text-[#92400e]">Dev-mode actief</p>
            <p className="text-[#92400e]">
              Er is geen mailprovider gekoppeld. Mails worden naar de
              server-console gelogd; de verificatielink is direct zichtbaar op{" "}
              <code>/verify/check</code>. Voor productie: zet{" "}
              <code>RESEND_API_KEY</code> of <code>SMTP_HOST</code> in je env.
            </p>
          </div>
        </div>
      )}

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Verificatie-mails"
          value={verifyMails}
          sublabel={`${pendingVerify} wachten nog`}
        />
        <Stat
          label="Claim-notificaties"
          value={claimMails}
          sublabel="contractor + consumer per claim"
        />
        <Stat
          label="Review-prompts"
          value={reviewMails}
          sublabel="na afgeronde klus"
        />
        <Stat label="Totaal verzonden" value={totalSent} accent="#f6b42c" />
      </section>

      <section className="kb-panel">
        <div className="flex items-center gap-3 mb-5">
          <Send size={20} className="text-[#3586b6]" />
          <div>
            <h2 className="kb-heading text-xl">Mail-flows</h2>
            <p className="text-sm text-[#5c6878] mt-0.5">
              Automatisch verstuurde mails per gebruikersactie.
            </p>
          </div>
        </div>
        <ul className="divide-y divide-[#eef2f7]">
          <FlowRow
            trigger="Registratie"
            recipient="Nieuwe gebruiker"
            subject="Bevestig je Klusblok-account"
            description="Bij elke nieuwe registratie wordt een verificatielink verstuurd."
          />
          <FlowRow
            trigger="Klus geclaimd + betaald"
            recipient="Klusplaatser (consument)"
            subject="Je klus is geclaimd op Klusblok"
            description="Particulier weet dat een kluszoeker binnen 2 uur belt."
          />
          <FlowRow
            trigger="Klus geclaimd + betaald"
            recipient="Kluszoeker (contractor)"
            subject="Contactgegevens voor je geclaimde klus"
            description="Bevat klant-telefoonnummer + adres."
          />
          <FlowRow
            trigger="Klus afgerond"
            recipient="Klusplaatser"
            subject="Je klus is afgerond — laat een review achter"
            description="Beoordelingsverzoek na bevestiging door beide partijen."
          />
          <FlowRow
            trigger="Klusverzoek vanuit klussers-overzicht"
            recipient="Kluszoeker"
            subject="Klusverzoek via Klusblok: ..."
            description="Klusplaatser stuurt direct een verzoek vanaf de klusser-profielpagina."
          />
        </ul>
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-3">Mailprovider</h2>
        <dl className="space-y-3 text-sm">
          <Row label="Status" value={isProductionMail ? "Productie" : "Dev (console)"} accent={isProductionMail ? "#10b981" : "#f6b42c"} />
          <Row label="Provider" value={process.env.RESEND_API_KEY ? "Resend" : process.env.SMTP_HOST ? "SMTP" : "Console log"} />
          <Row label="Verzend-domein" value={process.env.MAIL_FROM_DOMAIN ?? "Niet ingesteld"} />
        </dl>
        <p className="text-xs text-[#5c6878] mt-5">
          Plug-and-play: zet <code>RESEND_API_KEY</code> + <code>MAIL_FROM_DOMAIN</code> in
          Vercel env vars en update{" "}
          <code className="text-[#3586b6]">src/lib/notifications.ts</code> met
          de echte Resend SDK-aanroep.
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sublabel,
  accent = "#3586b6",
}: {
  label: string;
  value: number;
  sublabel?: string;
  accent?: string;
}) {
  return (
    <div className="kb-panel !p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-[#5c6878] font-semibold">
          {label}
        </p>
        <Mail size={16} style={{ color: accent }} />
      </div>
      <p className="kb-heading text-2xl">{value}</p>
      {sublabel && <p className="text-xs text-[#5c6878] mt-1">{sublabel}</p>}
    </div>
  );
}

function FlowRow({
  trigger,
  recipient,
  subject,
  description,
}: {
  trigger: string;
  recipient: string;
  subject: string;
  description: string;
}) {
  return (
    <li className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="kb-badge kb-badge--blue text-[10px]">
              {trigger}
            </span>
            <span className="text-xs text-[#5c6878]">→ {recipient}</span>
          </div>
          <p className="font-semibold text-sm text-[#1a2535] mt-2">{subject}</p>
          <p className="text-xs text-[#5c6878] mt-1">{description}</p>
        </div>
      </div>
    </li>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <dt className="text-[#5c6878]">{label}</dt>
      <dd
        className="font-bold"
        style={{ color: accent ?? "#1a2535" }}
      >
        {value}
      </dd>
    </div>
  );
}
