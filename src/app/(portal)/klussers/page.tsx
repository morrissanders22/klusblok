import Link from "next/link";
import { MapPin, ArrowRight, Star, User as UserIcon } from "lucide-react";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KlussersPage() {
  const klussers = await prisma.user.findMany({
    where: {
      role: "CONTRACTOR",
      kvkNumber: { not: null },
      hasLiabilityInsurance: true,
    },
    select: {
      id: true,
      name: true,
      companyName: true,
      city: true,
      bio: true,
      photoUrl: true,
      specialties: true,
      reviewsReceived: {
        select: { rating: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <header className="mb-8">
        <p className="kb-eyebrow">
          {klussers.length} klussers beschikbaar
        </p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Vind een klusser bij jou in de buurt
        </h1>
        <p className="text-[#5c6878] mt-2 max-w-2xl">
          Bekijk profielen van vakmensen. Klik op een profiel om direct een
          verzoek te sturen voor jouw klus.
        </p>
      </header>

      {klussers.length === 0 ? (
        <div className="kb-panel text-center py-12">
          <p className="kb-heading text-xl mb-2">
            Nog geen klussers geregistreerd
          </p>
          <p className="text-[#5c6878] text-sm">
            Klussers met KVK-nummer en rechtsbijstandsverzekering verschijnen
            hier zodra ze zich aanmelden.
          </p>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {klussers.map((k) => {
            const ratings = k.reviewsReceived.map((r) => r.rating);
            const avg =
              ratings.length === 0
                ? 0
                : ratings.reduce((s, r) => s + r, 0) / ratings.length;
            return (
              <li key={k.id}>
                <Link href={`/klussers/${k.id}`} className="kb-card block p-5">
                  <div className="flex gap-4 items-start mb-3">
                    <div
                      className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{
                        backgroundColor: "#f1f5f9",
                        border: "2px solid #e2e8f0",
                      }}
                    >
                      {k.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={k.photoUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon size={28} className="text-[#cbd5e1]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-extrabold text-[#1a2535] truncate">
                        {k.companyName ?? k.name}
                      </h2>
                      {k.city && (
                        <p className="text-xs text-[#5c6878] flex items-center gap-1 mt-1">
                          <MapPin size={11} /> {k.city}
                        </p>
                      )}
                      {ratings.length > 0 && (
                        <p className="flex items-center gap-1 text-xs mt-1">
                          <Star
                            size={11}
                            fill="#f6b42c"
                            color="#f6b42c"
                          />
                          <span className="font-bold text-[#92400e]">
                            {avg.toFixed(1)}
                          </span>
                          <span className="text-[#5c6878]">
                            ({ratings.length})
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {k.bio && (
                    <p className="text-sm text-[#5c6878] line-clamp-2 mb-3">
                      {k.bio}
                    </p>
                  )}

                  {k.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {k.specialties.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="kb-badge kb-badge--blue text-[10px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    className="flex items-center justify-end pt-3"
                    style={{ borderTop: "1px solid #f1f5f9" }}
                  >
                    <span className="flex items-center gap-1.5 text-sm font-bold text-[#3586b6]">
                      Bekijk profiel <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
