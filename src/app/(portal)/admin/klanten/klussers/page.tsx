import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, ShieldCheck, MapPin, Star, Plus, ChevronRight } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KlanteenKlussersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const klussers = await prisma.user.findMany({
    where: { role: "CONTRACTOR" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { claims: true, reviewsReceived: true } },
      reviewsReceived: { select: { rating: true } },
    },
  });

  return (
    <div>
      <header className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kb-eyebrow flex items-center gap-2">
            <Users size={12} /> Klanten · Kluszoekers
          </p>
          <h1 className="kb-heading text-3xl mt-2">
            Alle kluszoekers ({klussers.length})
          </h1>
          <p className="text-[#5c6878] mt-2">
            Overzicht van alle vakmensen die zich op het platform hebben
            aangemeld.
          </p>
        </div>
        <Link href="/admin/klanten/nieuw" className="btn-yellow">
          <Plus size={16} /> Nieuwe klant
        </Link>
      </header>

      <div className="kb-panel !p-0 overflow-hidden">
        {klussers.length === 0 ? (
          <p className="text-center py-12 text-[#5c6878]">
            Nog geen klussers geregistreerd.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead
              style={{ backgroundColor: "#f7f9fc", borderBottom: "1px solid #e2e8f0" }}
            >
              <tr className="text-left">
                <Th>Bedrijf</Th>
                <Th>Contact</Th>
                <Th>KVK</Th>
                <Th>Stad</Th>
                <Th>Claims</Th>
                <Th>Reviews</Th>
                <Th>Verzekerd</Th>
                <Th>Aangemeld</Th>
                <Th>&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {klussers.map((k) => {
                const ratings = k.reviewsReceived.map((r) => r.rating);
                const avg =
                  ratings.length === 0
                    ? null
                    : ratings.reduce((s, r) => s + r, 0) / ratings.length;
                return (
                  <tr
                    key={k.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="hover:bg-[#f7f9fc]"
                  >
                    <Td>
                      <Link
                        href={`/klussers/${k.id}`}
                        className="font-bold text-[#1a2535] hover:text-[#3586b6]"
                      >
                        {k.companyName ?? k.name}
                      </Link>
                    </Td>
                    <Td>
                      <span className="text-[#1a2535]">{k.name}</span>
                      <span className="text-xs text-[#5c6878] block">
                        {k.email}
                      </span>
                    </Td>
                    <Td>{k.kvkNumber ?? "—"}</Td>
                    <Td>
                      {k.city ? (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-[#5c6878]" />
                          {k.city}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>{k._count.claims}</Td>
                    <Td>
                      {avg ? (
                        <span className="flex items-center gap-1">
                          <Star size={12} fill="#f7c021" color="#f7c021" />
                          {avg.toFixed(1)} ({k._count.reviewsReceived})
                        </span>
                      ) : (
                        <span className="text-[#5c6878]">—</span>
                      )}
                    </Td>
                    <Td>
                      {k.hasLiabilityInsurance ? (
                        <ShieldCheck size={14} className="text-[#10b981]" />
                      ) : (
                        <span className="text-[#5c6878]">—</span>
                      )}
                    </Td>
                    <Td>
                      {new Date(k.createdAt).toLocaleDateString("nl-NL")}
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/klanten/${k.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#3586b6] hover:underline"
                      >
                        Beheer <ChevronRight size={12} />
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#5c6878]">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top">{children}</td>;
}
