import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  User as UserIcon,
  ShieldCheck,
  Mail,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function KlusserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const klusser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      companyName: true,
      city: true,
      bio: true,
      photoUrl: true,
      specialties: true,
      role: true,
      kvkNumber: true,
      hasLiabilityInsurance: true,
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          author: { select: { name: true } },
          job: { select: { title: true } },
        },
      },
    },
  });
  if (!klusser || klusser.role !== "CONTRACTOR") notFound();

  const ratings = klusser.reviewsReceived.map((r) => r.rating);
  const avg =
    ratings.length === 0
      ? 0
      : ratings.reduce((s, r) => s + r, 0) / ratings.length;

  const session = await auth();

  return (
    <div className="space-y-6">
      <Link
        href="/klussers"
        className="inline-flex items-center gap-1 text-sm text-[#5c6878] hover:text-[#3586b6]"
      >
        <ArrowLeft size={14} /> Alle klussers
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <header className="kb-panel">
            <div className="flex items-start gap-5 flex-wrap">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{
                  backgroundColor: "#f1f5f9",
                  border: "2px solid #e2e8f0",
                }}
              >
                {klusser.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={klusser.photoUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={40} className="text-[#cbd5e1]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="kb-eyebrow">Klusser</p>
                <h1 className="kb-heading text-3xl mt-1">
                  {klusser.companyName ?? klusser.name}
                </h1>
                {klusser.companyName && klusser.name !== klusser.companyName && (
                  <p className="text-sm text-[#5c6878] mt-1">
                    Contactpersoon: {klusser.name}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {klusser.city && (
                    <span className="kb-badge kb-badge--blue">
                      <MapPin size={11} /> {klusser.city}
                    </span>
                  )}
                  {ratings.length > 0 && (
                    <span className="kb-badge kb-badge--yellow">
                      <Star size={11} fill="#92400e" color="#92400e" />{" "}
                      {avg.toFixed(1)} ({ratings.length})
                    </span>
                  )}
                  {klusser.hasLiabilityInsurance && (
                    <span className="kb-badge kb-badge--green">
                      <ShieldCheck size={11} /> Verzekerd
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {klusser.bio && (
            <section className="kb-panel">
              <h2 className="kb-heading text-xl mb-3">Over deze klusser</h2>
              <p className="text-[#1a2535] leading-relaxed whitespace-pre-wrap">
                {klusser.bio}
              </p>
            </section>
          )}

          {klusser.specialties.length > 0 && (
            <section className="kb-panel">
              <h2 className="kb-heading text-xl mb-3">Specialiteiten</h2>
              <div className="flex flex-wrap gap-2">
                {klusser.specialties.map((s) => (
                  <span key={s} className="kb-badge kb-badge--blue">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {klusser.reviewsReceived.length > 0 && (
            <section className="kb-panel">
              <h2 className="kb-heading text-xl mb-4">Reviews van klanten</h2>
              <ul className="divide-y divide-[#eef2f7]">
                {klusser.reviewsReceived.map((r) => (
                  <li key={r.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-[#1a2535]">
                        {r.author.name}
                      </p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={12}
                            fill={n <= r.rating ? "#f7c021" : "transparent"}
                            color={n <= r.rating ? "#f7c021" : "#cbd5e1"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#5c6878] mb-2">
                      {r.job.title}
                    </p>
                    <p className="text-[#1a2535]">{r.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="kb-panel">
            <div className="flex items-center gap-2 mb-1">
              <Mail size={18} className="text-[#3586b6]" />
              <h2 className="kb-heading text-xl">Stuur een verzoek</h2>
            </div>
            <p className="text-sm text-[#5c6878] mb-5">
              Verstuur een klusverzoek per e-mail. De klusser neemt direct
              contact met je op.
            </p>
            {session?.user ? (
              <ContactForm
                klusserId={klusser.id}
                klusserName={klusser.companyName ?? klusser.name}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#5c6878]">
                  Log in als kluszoeker om een verzoek te sturen.
                </p>
                <Link
                  href={`/login/kluszoeker?next=/klussers/${klusser.id}`}
                  className="btn-yellow w-full justify-center"
                >
                  Inloggen
                </Link>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
