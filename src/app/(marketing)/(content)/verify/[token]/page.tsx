import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VerifyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { verifyToken: token },
    select: { id: true, emailVerified: true, role: true },
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
          style={{ backgroundColor: "#fef2f2", color: "#991b1b" }}
        >
          <XCircle size={28} />
        </div>
        <h1 className="kb-heading text-3xl">Verificatielink ongeldig</h1>
        <p className="text-[#5c6878] mt-3 mb-6">
          Deze link is verlopen of al gebruikt. Probeer opnieuw in te loggen,
          of registreer opnieuw.
        </p>
        <Link href="/login" className="btn-yellow">
          Naar inloggen <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  if (!user.emailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date(), verifyToken: null },
    });
  }

  const loginHref =
    user.role === "CONTRACTOR" ? "/login/klusser" : "/login/kluszoeker";

  return (
    <div className="max-w-md mx-auto text-center">
      <div
        className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6"
        style={{ backgroundColor: "#d1fae5", color: "#065f46" }}
      >
        <CheckCircle2 size={28} />
      </div>
      <p className="kb-eyebrow">Geverifieerd</p>
      <h1 className="kb-heading text-3xl mt-2">Je account is actief!</h1>
      <p className="text-[#5c6878] mt-3 mb-6">
        Welkom bij Klusblok. Log in om te beginnen.
      </p>
      <Link href={loginHref} className="btn-yellow">
        Inloggen <ArrowRight size={14} />
      </Link>
    </div>
  );
}
