import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { XCircle } from "lucide-react";

import { prisma } from "@/lib/db";
import { fetchMollieStatus } from "@/lib/payments";
import { activateClaim } from "@/app/(portal)/jobs/[id]/actions";

export const dynamic = "force-dynamic";

export default async function PaymentReturnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { claim: true },
  });
  if (!payment) notFound();

  if (payment.status !== "PAID" && payment.providerRef) {
    const newStatus = await fetchMollieStatus(payment.providerRef);
    if (newStatus !== payment.status) {
      await prisma.payment.update({
        where: { id },
        data: {
          status: newStatus,
          paidAt: newStatus === "PAID" ? new Date() : payment.paidAt,
        },
      });
      if (newStatus === "PAID") {
        await activateClaim(payment.claimId);
      }
    }
  }

  const fresh = await prisma.payment.findUnique({ where: { id } });
  if (fresh?.status === "PAID") {
    redirect(`/claims/${payment.claimId}`);
  }

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="kb-panel text-center">
        <XCircle size={40} className="mx-auto text-[#dc2626] mb-4" />
        <h1 className="kb-heading text-2xl mb-2">Betaling niet voltooid</h1>
        <p className="text-[#5c6878] mb-5 text-sm">
          We hebben nog geen bevestiging van je betaling ontvangen. Probeer
          het opnieuw of bekijk je actieve claims in het dashboard.
        </p>
        <Link href="/dashboard" className="btn-yellow">
          Naar dashboard
        </Link>
      </div>
    </div>
  );
}
