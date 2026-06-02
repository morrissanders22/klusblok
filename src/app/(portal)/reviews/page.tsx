import { redirect } from "next/navigation";
import { Star } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/reviews");

  const reviews = await prisma.review.findMany({
    where: { subjectId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      job: { select: { title: true, city: true } },
    },
  });

  const avg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="kb-eyebrow flex items-center gap-2">
          <Star size={12} /> Reviews
        </p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Reviews van klanten
        </h1>
        <p className="text-[#5c6878] mt-2">
          Wat klanten over je werk zeggen.
        </p>
      </header>

      {reviews.length > 0 && (
        <div className="kb-panel flex items-center gap-6">
          <div>
            <p className="kb-heading text-4xl text-[#3586b6]">{avg.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={14}
                  fill={n <= Math.round(avg) ? "#f7c021" : "transparent"}
                  color={n <= Math.round(avg) ? "#f7c021" : "#cbd5e1"}
                />
              ))}
            </div>
          </div>
          <div
            className="text-sm text-[#5c6878] pl-6"
            style={{ borderLeft: "1px solid #eef2f7" }}
          >
            Gebaseerd op {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </div>
        </div>
      )}

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-4">Alle reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-center text-[#5c6878] py-8">
            Je hebt nog geen reviews ontvangen. Reviews komen automatisch
            binnen na een afgeronde klus.
          </p>
        ) : (
          <ul className="divide-y divide-[#eef2f7]">
            {reviews.map((r) => (
              <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[#1a2535]">{r.author.name}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        fill={n <= r.rating ? "#f7c021" : "transparent"}
                        color={n <= r.rating ? "#f7c021" : "#cbd5e1"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#5c6878] mb-1">
                  {r.job.title} · {r.job.city}
                </p>
                <p className="text-[#1a2535] mt-2">{r.body}</p>
                <p className="text-xs text-[#5c6878] mt-2">
                  {new Date(r.createdAt).toLocaleDateString("nl-NL")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
