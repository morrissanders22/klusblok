import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, MapPin, Briefcase, CheckCircle2, Plus, ChevronRight } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KlanteenKluszoekersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const kluszoekers = await prisma.user.findMany({
    where: { role: "CONSUMER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { jobs: true } },
    },
  });

  return (
    <div>
      <header className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="kb-eyebrow flex items-center gap-2">
            <Users size={12} /> Klanten · Klusplaatsers
          </p>
          <h1 className="kb-heading text-3xl mt-2">
            Alle klusplaatsers ({kluszoekers.length})
          </h1>
          <p className="text-[#5c6878] mt-2">
            Particulieren die klussen hebben geplaatst of zich hebben
            aangemeld.
          </p>
        </div>
        <Link href="/admin/klanten/nieuw" className="btn-yellow">
          <Plus size={16} /> Nieuwe klant
        </Link>
      </header>

      <div className="kb-panel !p-0 overflow-hidden">
        {kluszoekers.length === 0 ? (
          <p className="text-center py-12 text-[#5c6878]">
            Nog geen kluszoekers geregistreerd.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead
              style={{ backgroundColor: "#f7f9fc", borderBottom: "1px solid #e2e8f0" }}
            >
              <tr className="text-left">
                <Th>Naam</Th>
                <Th>E-mail</Th>
                <Th>Telefoon</Th>
                <Th>Stad</Th>
                <Th>Klussen</Th>
                <Th>Geverifieerd</Th>
                <Th>Aangemeld</Th>
                <Th>&nbsp;</Th>
              </tr>
            </thead>
            <tbody>
              {kluszoekers.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                  className="hover:bg-[#f7f9fc]"
                >
                  <Td>
                    <span className="font-bold text-[#1a2535]">{u.name}</span>
                  </Td>
                  <Td className="text-[#5c6878]">{u.email}</Td>
                  <Td>{u.phone ?? "—"}</Td>
                  <Td>
                    {u.city ? (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-[#5c6878]" />
                        {u.city}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={11} className="text-[#5c6878]" />
                      {u._count.jobs}
                    </span>
                  </Td>
                  <Td>
                    {u.emailVerified ? (
                      <CheckCircle2 size={14} className="text-[#10b981]" />
                    ) : (
                      <span className="kb-badge kb-badge--yellow text-[10px]">
                        Wacht
                      </span>
                    )}
                  </Td>
                  <Td>
                    {new Date(u.createdAt).toLocaleDateString("nl-NL")}
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/klanten/${u.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#3586b6] hover:underline"
                    >
                      Beheer <ChevronRight size={12} />
                    </Link>
                  </Td>
                </tr>
              ))}
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

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
