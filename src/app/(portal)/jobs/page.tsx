import Link from "next/link";
import { MapPin, Plus, ArrowRight } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { expireStaleClaims } from "@/lib/claims";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const session = await auth();
  await expireStaleClaims();

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      services: true,
      photos: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  const isContractor = session?.user?.role === "CONTRACTOR";

  return (
    <div>
      <header className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <p className="kb-eyebrow">
            {jobs.length} open klus{jobs.length === 1 ? "" : "sen"}
          </p>
          <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
            Vind een klus
          </h1>
          <p className="text-[#5c6878] mt-2 max-w-xl">
            {isContractor
              ? "Claim een klus om de contactgegevens te krijgen. Je hebt daarna 2 uur om contact op te nemen."
              : "Een aannemer betaalt eenmalig om jouw klus te claimen — voor jou blijft het altijd gratis."}
          </p>
        </div>
        {!isContractor && (
          <Link href="/jobs/new" className="btn-yellow">
            <Plus size={16} /> Plaats klus
          </Link>
        )}
      </header>

      {jobs.length === 0 ? (
        <div className="kb-panel text-center py-12">
          <p className="kb-heading text-xl mb-2">Geen open klussen</p>
          <p className="text-[#5c6878] mb-5 text-sm">
            Er staan op dit moment geen open klussen.
          </p>
          {!isContractor && (
            <Link href="/jobs/new" className="btn-yellow">
              Plaats de eerste klus
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link href={`/jobs/${job.id}`} className="kb-card block group">
                <div className="aspect-video bg-[#f1f5f9] overflow-hidden">
                  {job.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.photos[0].url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#cbd5e1] text-xs uppercase tracking-wider">
                      Geen foto
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {job.services.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className="kb-badge kb-badge--blue"
                      >
                        {s.service}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-extrabold text-[#1a2535] text-lg leading-tight mb-2 line-clamp-2">
                    {job.title}
                  </h2>
                  <p className="text-sm text-[#5c6878] line-clamp-2 mb-4">
                    {job.description}
                  </p>
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <span className="flex items-center gap-1 text-xs text-[#5c6878]">
                      <MapPin size={12} /> {job.city}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm font-bold text-[#3586b6]">
                      Bekijk klus <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
