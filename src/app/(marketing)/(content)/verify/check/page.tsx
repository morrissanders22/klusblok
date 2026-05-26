import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/db";
import { verifyUrl } from "@/lib/verify";

export const dynamic = "force-dynamic";

export default async function VerifyCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; role?: string }>;
}) {
  const { email, role } = await searchParams;
  const isDev = !process.env.RESEND_API_KEY && !process.env.SMTP_HOST;

  // For dev/demo: surface the verify link directly so the demo flow works
  // without a real mail provider configured.
  let devLink: string | null = null;
  if (isDev && email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { verifyToken: true, emailVerified: true },
    });
    if (user?.verifyToken && !user.emailVerified) {
      devLink = verifyUrl(user.verifyToken);
    }
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <div
        className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
        style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
      >
        <Mail size={28} />
      </div>
      <p className="kb-eyebrow">Bijna klaar</p>
      <h1 className="kb-heading text-3xl mt-2">Bevestig je e-mailadres</h1>
      <p className="text-[#5c6878] mt-3">
        We hebben een e-mail gestuurd naar{" "}
        <strong className="text-[#1a2535]">{email ?? "je inbox"}</strong>.
        Klik op de link in de mail om je account te activeren.
      </p>

      {devLink && (
        <div
          className="mt-6 rounded-xl border p-4 text-left"
          style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
        >
          <p className="text-xs font-bold text-[#92400e] uppercase tracking-wider mb-2">
            🛠 Demo-mode
          </p>
          <p className="text-sm text-[#92400e] mb-3">
            Er is geen mailprovider geconfigureerd. Klik direct op de
            verificatielink om door te gaan:
          </p>
          <Link
            href={devLink}
            className="btn-yellow w-full justify-center"
          >
            Verifieer mijn account <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="mt-8 text-sm text-[#5c6878] space-y-2">
        <p>Geen mail ontvangen? Check je spamfolder.</p>
        <p>
          <Link
            href={`/login/${role === "klusser" ? "klusser" : "kluszoeker"}`}
            className="text-[#3586b6] font-bold hover:underline"
          >
            Naar inloggen →
          </Link>
        </p>
      </div>
    </div>
  );
}
