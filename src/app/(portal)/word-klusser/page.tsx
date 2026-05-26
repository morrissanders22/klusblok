import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Hammer } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UpgradeForm } from "./UpgradeForm";

export const dynamic = "force-dynamic";

export default async function WordKlusserPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/word-klusser");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      kvkNumber: true,
      hasLiabilityInsurance: true,
      companyName: true,
      phone: true,
    },
  });

  if (me?.kvkNumber && me.hasLiabilityInsurance) {
    redirect("/dashboard");
  }

  const { next } = await searchParams;

  return (
    <div className="max-w-lg mx-auto">
      <header className="mb-6">
        <p className="kb-eyebrow flex items-center gap-2">
          <Hammer size={12} /> Account uitbreiden
        </p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Word ook klusser
        </h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Voeg je KVK-gegevens toe om klussen te kunnen claimen. Je kunt
          daarna eenvoudig switchen tussen modus &quot;klusser&quot; en
          &quot;kluszoeker&quot; in de zijbalk.
        </p>
      </header>
      <div className="kb-panel">
        <Suspense>
          <UpgradeForm
            defaults={{
              companyName: me?.companyName ?? "",
              phone: me?.phone ?? "",
            }}
            nextHref={next}
          />
        </Suspense>
      </div>
    </div>
  );
}
