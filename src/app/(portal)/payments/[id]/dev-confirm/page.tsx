import { notFound, redirect } from "next/navigation";
import { CreditCard, AlertTriangle } from "lucide-react";

import { prisma } from "@/lib/db";
import { activateClaim } from "@/app/(portal)/jobs/[id]/actions";
import { isDevPaymentMode } from "@/lib/payments";
import { formatEuro } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function DevConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isDevPaymentMode()) {
    redirect("/");
  }

  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { claim: { include: { job: true } } },
  });
  if (!payment) notFound();

  async function confirm() {
    "use server";
    await prisma.payment.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });
    await activateClaim(payment!.claimId);
    redirect(`/claims/${payment!.claimId}`);
  }

  return (
    <div className="max-w-md mx-auto space-y-4 mt-6">
      <div
        className="rounded-xl border p-4 flex items-start gap-3"
        style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
      >
        <AlertTriangle size={18} className="text-[#92400e] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#92400e]">
          <strong>Dev-mode betaling.</strong> Er is geen Mollie API key
          geconfigureerd. In productie zou je hier op de echte Mollie checkout
          zitten.
        </div>
      </div>

      <div className="kb-panel">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#f1f5f9", color: "#3586b6" }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <p className="kb-eyebrow">Betaling</p>
            <h1 className="kb-heading text-2xl">Bevestig je claim</h1>
          </div>
        </div>

        <dl className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-[#5c6878]">Klus</dt>
            <dd className="font-semibold text-right">{payment.claim.job.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[#5c6878]">Plaats</dt>
            <dd className="font-semibold">{payment.claim.job.city}</dd>
          </div>
          <div
            className="flex justify-between pt-3"
            style={{ borderTop: "1px solid #eef2f7" }}
          >
            <dt className="font-semibold">Te betalen</dt>
            <dd className="kb-heading text-2xl text-[#3586b6]">
              {formatEuro(payment.amountCents)}
            </dd>
          </div>
        </dl>

        <form action={confirm}>
          <button type="submit" className="btn-yellow w-full justify-center">
            Betaling simuleren →
          </button>
        </form>
      </div>
    </div>
  );
}
