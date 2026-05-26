import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Star } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ReviewForm } from "./ReviewForm";

export const dynamic = "force-dynamic";

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ claim?: string }>;
}) {
  const { claim: claimId } = await searchParams;
  if (!claimId) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/login?next=/reviews/new?claim=${claimId}`);

  const claim = await prisma.jobClaim.findUnique({
    where: { id: claimId },
    include: {
      job: true,
      contractor: { select: { name: true, companyName: true } },
    },
  });
  if (!claim || claim.job.consumerId !== session.user.id) notFound();

  return (
    <div className="max-w-lg mx-auto">
      <header className="mb-6">
        <p className="kb-eyebrow flex items-center gap-2">
          <Star size={12} /> Review
        </p>
        <h1 className="kb-heading text-3xl mt-2">Beoordeel de klusser</h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Klus: <strong>{claim.job.title}</strong> ·{" "}
          {claim.contractor.companyName ?? claim.contractor.name}
        </p>
      </header>
      <div className="kb-panel">
        <Suspense fallback={<p>Laden…</p>}>
          <ReviewForm claimId={claim.id} />
        </Suspense>
      </div>
    </div>
  );
}
