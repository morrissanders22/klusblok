import { redirect } from "next/navigation";
import {
  Plug,
  CreditCard,
  Image as ImageIcon,
  Mail,
  Map,
  Star,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const integrations = [
    {
      name: "Mollie",
      description:
        "Betalingen via iDEAL/creditcard. Klusser betaalt eenmalig per claim.",
      Icon: CreditCard,
      connected: !!process.env.MOLLIE_API_KEY,
      detail: process.env.MOLLIE_API_KEY
        ? process.env.MOLLIE_API_KEY.startsWith("live_")
          ? "Live mode actief"
          : "Test mode actief"
        : "Niet gekoppeld — betalingen draaien in dev-mode (auto-confirm)",
      envKeys: ["MOLLIE_API_KEY"],
      docsUrl: "https://www.mollie.com/dashboard/",
      docsLabel: "Mollie dashboard",
    },
    {
      name: "Vercel Blob",
      description:
        "Opslag voor foto-uploads bij klussen. Geüploade beelden worden publiek geserveerd via Vercel's CDN.",
      Icon: ImageIcon,
      connected: !!process.env.BLOB_READ_WRITE_TOKEN,
      detail: process.env.BLOB_READ_WRITE_TOKEN
        ? "Token geconfigureerd — uploads gaan naar Blob storage"
        : "Niet gekoppeld — uploads worden lokaal opgeslagen (werkt niet op Vercel)",
      envKeys: ["BLOB_READ_WRITE_TOKEN"],
      docsUrl: "https://vercel.com/docs/storage/vercel-blob",
      docsLabel: "Vercel Blob docs",
    },
    {
      name: "E-mail (Resend / SMTP)",
      description:
        "Transactionele mails: verificatie, claim-notificaties, review-prompts.",
      Icon: Mail,
      connected: !!process.env.RESEND_API_KEY || !!process.env.SMTP_HOST,
      detail:
        process.env.RESEND_API_KEY
          ? "Resend gekoppeld"
          : process.env.SMTP_HOST
            ? `SMTP gekoppeld (${process.env.SMTP_HOST})`
            : "Niet gekoppeld — mails worden naar de console gelogd",
      envKeys: ["RESEND_API_KEY", "MAIL_FROM_DOMAIN"],
      docsUrl: "https://resend.com",
      docsLabel: "Resend",
    },
    {
      name: "Google Maps",
      description:
        "Route-knop op klusdetails opent Google Maps met richtingen naar het klusadres.",
      Icon: Map,
      connected: true,
      detail: "Standaard ingeschakeld via publieke Google Maps URLs (geen API-key nodig)",
      envKeys: [],
    },
    {
      name: "Google Reviews",
      description:
        "Klant-reviews die meetellen op je Google Bedrijfsprofiel — geplande integratie via Places API.",
      Icon: Star,
      connected: false,
      detail: "Nog niet gekoppeld — in-app reviews zijn momenteel actief",
      envKeys: ["GOOGLE_PLACES_API_KEY"],
      docsUrl: "https://developers.google.com/maps/documentation/places/web-service",
      docsLabel: "Places API docs",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="kb-eyebrow flex items-center gap-2">
          <Plug size={12} /> Integraties
        </p>
        <h1 className="kb-heading text-3xl mt-2">
          Externe diensten & koppelingen
        </h1>
        <p className="text-[#5c6878] mt-2">
          Status van alle gekoppelde services. Voor productie hebben Mollie,
          Vercel Blob en een mailprovider de aanbeveling.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 gap-4">
        {integrations.map((it) => (
          <div key={it.name} className="kb-panel">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: it.connected ? "#ecfdf5" : "#f7f9fc",
                  color: it.connected ? "#065f46" : "#5c6878",
                }}
              >
                <it.Icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h2 className="kb-heading text-xl">{it.name}</h2>
                  {it.connected ? (
                    <span className="kb-badge kb-badge--green inline-flex items-center gap-1">
                      <CheckCircle2 size={11} /> Actief
                    </span>
                  ) : (
                    <span className="kb-badge kb-badge--gray inline-flex items-center gap-1">
                      <XCircle size={11} /> Niet gekoppeld
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#5c6878] mt-1">{it.description}</p>
              </div>
            </div>

            <div
              className="rounded-lg p-3 text-sm mb-3"
              style={{
                backgroundColor: it.connected ? "#ecfdf5" : "#fffbeb",
                border: `1px solid ${it.connected ? "#a7f3d0" : "#fde68a"}`,
                color: it.connected ? "#065f46" : "#92400e",
              }}
            >
              {it.detail}
            </div>

            {it.envKeys.length > 0 && (
              <div className="text-xs">
                <p className="font-semibold text-[#5c6878] uppercase tracking-wider mb-1.5">
                  Env vars
                </p>
                <ul className="space-y-1">
                  {it.envKeys.map((k) => (
                    <li key={k}>
                      <code
                        className="text-[#1a2535] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#f1f5f9" }}
                      >
                        {k}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {it.docsUrl && (
              <a
                href={it.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-bold text-[#3586b6] hover:underline mt-4"
              >
                {it.docsLabel} <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </section>

      <section
        className="kb-panel"
        style={{ backgroundColor: "#eff6fc", borderColor: "#bfdbfe" }}
      >
        <h2 className="kb-heading text-xl mb-2">Env vars beheren</h2>
        <p className="text-sm text-[#1a2535] mb-3">
          Alle integratie-keys staan in <strong>Vercel Project Settings → Environment Variables</strong>.
          Na elke wijziging is een nieuwe deploy nodig om de waardes op te
          pikken.
        </p>
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1e40af] hover:underline"
        >
          Open Vercel dashboard <ExternalLink size={12} />
        </a>
      </section>
    </div>
  );
}
