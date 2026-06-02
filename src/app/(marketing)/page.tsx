import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Hammer,
  Home as HomeIcon,
  Sparkles,
  Clock,
  Euro,
  Shield,
  Star,
  MapPin,
  Phone,
  Quote,
} from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { KlussenGrid, type KlusItem } from "@/components/home/KlussenGrid";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const YELLOW = "#fcc419";
const BLUE = "#3586b6";
const NAVY = "#0f2535";

const CATEGORIES = [
  { name: "Loodgieter", slug: "loodgieter", img: "/categories/loodgieter.png" },
  { name: "Timmerman", slug: "timmerman", img: "/categories/timmerman.png" },
  { name: "Schilder", slug: "schilder", img: "/categories/schilder.png" },
  { name: "Elektricien", slug: "elektricien", img: "/categories/elektricien.png" },
  { name: "Tegelzetter", slug: "tegelzetter", img: "/categories/tegelzetter.png" },
  { name: "Stukadoor", slug: "stukadoor", img: "/categories/stukadoor.png" },
  { name: "Dakdekker", slug: "dakdekker", img: "/categories/dakdekker.png" },
  { name: "Tuinman", slug: "tuinman", img: "/categories/tuinman.png" },
  { name: "Schoonmaak", slug: "schoonmaak", img: "/categories/schoonmaak.png" },
  { name: "Verhuizer", slug: "verhuizer", img: "/categories/verhuizer.png" },
  { name: "Metselaar", slug: "metselaar", img: "/categories/metselaar.png" },
  { name: "Klein onderhoud", slug: "onderhoud", img: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=600&q=80" },
];

const STEPS = [
  {
    num: "01",
    title: "Maak gratis een account",
    desc: "Als klusplaatser of als kluszoeker. Geen abonnement, geen verborgen kosten.",
    img: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=800&q=80",
  },
  {
    num: "02",
    title: "Plaats of vind een klus",
    desc: "Beschrijf je klus met foto's, of blader door beschikbare opdrachten in jouw regio.",
    img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  },
  {
    num: "03",
    title: "Aan de slag binnen 2 uur",
    desc: "De kluszoeker neemt direct contact met je op na het claimen.",
    img: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=800&q=80",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah van Dijk",
    role: "Klusplaatser",
    city: "Utrecht",
    avatar: "https://i.pravatar.cc/120?img=47",
    quote:
      "Binnen twee uur belde een vakman over mijn keukenklus. Veel sneller dan ik had verwacht — en geen abonnement!",
    rating: 5,
  },
  {
    name: "Mark de Wit",
    role: "Kluszoeker",
    city: "Rotterdam",
    avatar: "https://i.pravatar.cc/120?img=12",
    quote:
      "Eerlijke prijzen, geen mollen, en ik weet precies wat ik betaal per lead. Eindelijk een platform dat werkt.",
    rating: 5,
  },
  {
    name: "Femke Janssen",
    role: "Klusplaatser",
    city: "Amsterdam",
    avatar: "https://i.pravatar.cc/120?img=44",
    quote:
      "Mijn badkamerverbouwing was binnen een week opgepakt. De foto's vooraf hielpen om snel de juiste vakman te vinden.",
    rating: 5,
  },
];

export default async function Home() {
  const [recent, topKlussers] = await Promise.all([
    prisma.job
      .findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { services: { take: 1 } },
      })
      .catch(() => []),
    prisma.user
      .findMany({
        where: {
          role: "CONTRACTOR",
          kvkNumber: { not: null },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          companyName: true,
          city: true,
          photoUrl: true,
          specialties: true,
        },
      })
      .catch(() => []),
  ]);

  const klussen: KlusItem[] = recent.map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description,
    city: j.city,
    createdAt: j.createdAt.toISOString().slice(0, 10),
    firstService: j.services[0]?.service ?? "Anders",
  }));

  return (
    <div className="bg-white">
      {/* HERO — centered, two big options in the middle */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#f7f9fc" }}
      >
        {/* decorative dots */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage:
              "linear-gradient(180deg, transparent 0%, white 30%, white 70%, transparent 100%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-10 pt-16 pb-12 lg:pt-24 lg:pb-16 text-center">
          <Reveal>
            <p
              className="kb-eyebrow inline-flex items-center gap-2 mb-4"
              style={{ color: BLUE }}
            >
              <Sparkles size={12} /> Welkom bij Klusblok · Eerlijk klusplatform
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1
              className="kb-heading mx-auto max-w-4xl"
              style={{
                fontSize: "clamp(42px, 6vw, 72px)",
                lineHeight: 1.04,
                color: NAVY,
              }}
            >
              Jouw klus plaatsen of <br />
              <span style={{ color: BLUE }}>vindt jouw klus</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 mx-auto max-w-xl text-lg text-[#5c6878] leading-relaxed">
              De eerlijke marktplaats voor klussen. Plaats gratis je klus of
              vind nieuw werk bij jou in de buurt.
            </p>
          </Reveal>

          {/* TWO BIG OPTIONS — centered, side-by-side */}
          <Reveal delay={300}>
            <div className="mt-12 grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
              <BigCtaCard
                Icon={HomeIcon}
                label="Ik ben een klusplaatser"
                title="Plaats jouw klus"
                description="Gratis & in 3 stappen"
                href="/register/consumer"
                accent={YELLOW}
                accentText={NAVY}
                primary
              />
              <BigCtaCard
                Icon={Hammer}
                label="Ik ben een kluszoeker"
                title="Vind jouw klus"
                description="Vanaf € 6 per claim"
                href="/register/contractor"
                accent={NAVY}
                accentText="white"
              />
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-[#5c6878]">
              <Tag Icon={CheckCircle} text="100% gratis plaatsen" />
              <Tag Icon={Shield} text="KVK-geverifieerd" />
              <Tag Icon={Clock} text="Reactie binnen 2 uur" />
              <Tag Icon={Euro} text="Geen abonnement" />
            </div>
          </Reveal>
        </div>

        {/* Floating trust strip below */}
        <div className="relative bg-white border-t border-[#e2e8f0]">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <TrustStat value="1.000+" label="Klussen geplaatst" />
            <TrustStat value="500+" label="Vakmensen actief" />
            <TrustStat value="4.8★" label="Gem. beoordeling" />
            <TrustStat value="2u" label="Avg. reactietijd" />
          </div>
        </div>
      </section>

      {/* CATEGORIES — Werkspot-style image tile grid */}
      <section className="bg-white py-20 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
              <div>
                <p className="kb-eyebrow" style={{ color: BLUE }}>
                  Veel gezocht
                </p>
                <h2
                  className="kb-heading mt-3"
                  style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
                >
                  Klussen per categorie
                </h2>
              </div>
              <Link
                href="/register/consumer"
                className="inline-flex items-center gap-1.5 text-sm font-bold pb-1"
                style={{ color: BLUE, borderBottom: `2px solid ${BLUE}` }}
              >
                Plaats jouw klus <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.slug} delay={i * 40}>
                <CategoryTile name={cat.name} img={cat.img} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — with images per step */}
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "#f7f9fc" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="kb-eyebrow" style={{ color: BLUE }}>
                Hoe het werkt
              </p>
              <h2
                className="kb-heading mt-3"
                style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
              >
                In drie eenvoudige stappen
              </h2>
              <p className="mt-4 text-[#5c6878] text-lg">
                Van klus plaatsen tot afgerond werk — direct contact, eerlijke
                tarieven.
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 100}>
                <div
                  className="rounded-2xl overflow-hidden bg-white"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div
                    className="aspect-[16/10] relative overflow-hidden"
                    style={{ backgroundColor: "#eef2f7" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg"
                      style={{
                        backgroundColor: YELLOW,
                        color: NAVY,
                        fontFamily: "var(--font-heading-barlow)",
                      }}
                    >
                      {s.num}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3
                      className="kb-heading mb-2"
                      style={{ fontSize: "20px" }}
                    >
                      {s.title}
                    </h3>
                    <p className="text-[#5c6878] leading-relaxed text-[15px]">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RECENTE KLUSSEN */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
              <div>
                <p className="kb-eyebrow" style={{ color: BLUE }}>
                  Live op het platform
                </p>
                <h2
                  className="kb-heading mt-3"
                  style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
                >
                  Vind een passende klus 🔨
                </h2>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 text-sm font-bold pb-1"
                style={{ color: BLUE, borderBottom: `2px solid ${BLUE}` }}
              >
                Bekijk alle klussen <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          {klussen.length === 0 ? (
            <div
              className="rounded-2xl bg-white p-12 text-center"
              style={{ border: "1px solid #e2e8f0" }}
            >
              <p className="text-[#5c6878]">
                Nog geen open klussen.{" "}
                <Link
                  href="/jobs/new"
                  className="font-bold underline"
                  style={{ color: BLUE }}
                >
                  Plaats de eerste klus →
                </Link>
              </p>
            </div>
          ) : (
            <KlussenGrid items={klussen} />
          )}
        </div>
      </section>

      {/* SFEERFOTO BANNER — visual break + extra image */}
      <section
        className="relative h-[280px] lg:h-[360px] overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,37,53,0.7) 0%, rgba(15,37,53,0.4) 60%, rgba(15,37,53,0.1) 100%)",
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-6 sm:px-10 h-full flex items-center">
          <Reveal>
            <div className="max-w-md text-white">
              <p
                className="kb-eyebrow"
                style={{ color: YELLOW, opacity: 1 }}
              >
                Ervaren vakmensen
              </p>
              <h2
                className="kb-heading mt-3 text-white"
                style={{ fontSize: "clamp(28px, 3.5vw, 40px)", color: "white" }}
              >
                Alleen KVK-geverifieerde kluszoekers
              </h2>
              <p className="mt-3 text-white/80 text-[15px] leading-relaxed">
                Iedere kluszoeker registreert zich met KVK-nummer en
                rechtsbijstandsverzekering. Vakmanschap waar je op kunt
                rekenen.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* TOP KLUSZOEKERS */}
      {topKlussers.length > 0 && (
        <section
          className="py-20 lg:py-28"
          style={{ backgroundColor: "#f7f9fc" }}
        >
          <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
            <Reveal>
              <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
                <div>
                  <p className="kb-eyebrow" style={{ color: BLUE }}>
                    Vakmensen
                  </p>
                  <h2
                    className="kb-heading mt-3"
                    style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
                  >
                    Maak kennis met onze kluszoekers
                  </h2>
                </div>
                <Link
                  href="/klussers"
                  className="inline-flex items-center gap-1.5 text-sm font-bold pb-1"
                  style={{ color: BLUE, borderBottom: `2px solid ${BLUE}` }}
                >
                  Alle vakmensen <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topKlussers.map((k, i) => (
                <Reveal key={k.id} delay={i * 80}>
                  <Link
                    href={`/klussers/${k.id}`}
                    className="block rounded-2xl bg-white p-5 transition-all hover:-translate-y-1"
                    style={{
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 2px rgba(15,37,53,0.03)",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: "#eef2f7" }}
                      >
                        {k.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={k.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#9aa6b5]">
                            <Hammer size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[#1a2535] truncate">
                          {k.companyName ?? k.name}
                        </p>
                        {k.city && (
                          <p className="text-xs text-[#5c6878] flex items-center gap-1 mt-1">
                            <MapPin size={11} /> {k.city}
                          </p>
                        )}
                      </div>
                    </div>
                    {k.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {k.specialties.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "#eff6fc",
                              color: BLUE,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                    <div
                      className="mt-4 pt-4 flex items-center justify-between text-xs"
                      style={{ borderTop: "1px solid #eef2f7" }}
                    >
                      <span className="flex items-center gap-1">
                        <Shield size={12} className="text-[#10b981]" />
                        <span className="font-semibold text-[#5c6878]">
                          KVK
                        </span>
                      </span>
                      <span
                        className="font-bold inline-flex items-center gap-1"
                        style={{ color: BLUE }}
                      >
                        Profiel <ArrowRight size={11} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="kb-eyebrow" style={{ color: BLUE }}>
                Wat klanten zeggen
              </p>
              <h2
                className="kb-heading mt-3"
                style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
              >
                4.8★ gemiddeld
              </h2>
              <p className="mt-4 text-[#5c6878] text-lg">
                Honderden vakmensen en huiseigenaren werken al via Klusblok.
              </p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div
                  className="rounded-2xl bg-white p-7 h-full flex flex-col"
                  style={{
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px rgba(15,37,53,0.03)",
                  }}
                >
                  <Quote
                    size={28}
                    style={{ color: YELLOW }}
                    className="mb-4"
                  />
                  <p className="text-[#1a2535] leading-relaxed text-[15px] flex-1 mb-5">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                      style={{ backgroundColor: "#eef2f7" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#1a2535] truncate">
                        {t.name}
                      </p>
                      <p className="text-xs text-[#5c6878]">
                        {t.role} · {t.city}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star
                          key={j}
                          size={12}
                          style={{ color: YELLOW }}
                          fill={YELLOW}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL CTA BANNER */}
      <section className="bg-white pb-20 lg:pb-28">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <Reveal>
            <div
              className="rounded-3xl p-10 lg:p-16 grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-center"
              style={{
                background:
                  "linear-gradient(135deg, #eff6fc 0%, #f7f9fc 100%)",
              }}
            >
              <div>
                <p className="kb-eyebrow" style={{ color: BLUE }}>
                  Klaar om te beginnen?
                </p>
                <h2
                  className="kb-heading mt-3"
                  style={{
                    fontSize: "clamp(28px, 3.5vw, 42px)",
                    color: NAVY,
                  }}
                >
                  Heb jij hulp nodig in huis door een ervaren kluszoeker?
                  <br />
                  <span style={{ color: BLUE }}>
                    Of ben jij als ervaren kluszoeker juist snel op zoek naar
                    werk?
                  </span>
                </h2>
                <p className="mt-5 text-[#5c6878] text-lg leading-relaxed">
                  In 3 simpele stappen breng je vraag en aanbod bij elkaar via
                  Klusblok.
                </p>
              </div>
              <div className="space-y-3">
                <Link
                  href="/register/consumer"
                  className="btn-yellow w-full justify-between"
                  style={{
                    padding: "16px 24px",
                    fontSize: "15px",
                    borderRadius: "12px",
                  }}
                >
                  Plaats jouw klus <ArrowRight size={16} />
                </Link>
                <Link
                  href="/register/contractor"
                  className="w-full inline-flex justify-between items-center font-bold text-sm rounded-xl"
                  style={{
                    backgroundColor: "white",
                    color: NAVY,
                    border: "1.5px solid " + NAVY,
                    padding: "16px 24px",
                  }}
                >
                  Word kluszoeker <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OVER ONS */}
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "#f7f9fc" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{ aspectRatio: "4/5" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=800&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute bottom-6 left-6 right-6 rounded-2xl p-4 bg-white"
                  style={{ boxShadow: "0 8px 24px rgba(15,37,53,0.15)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "#dcfce7", color: "#10b981" }}
                    >
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1a2535]">
                        100% KVK-geverifieerd
                      </p>
                      <p className="text-xs text-[#5c6878]">
                        Alle kluszoekers gecheckt
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div>
                <p className="kb-eyebrow" style={{ color: BLUE }}>
                  Over Klusblok
                </p>
                <h2
                  className="kb-heading mt-3"
                  style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
                >
                  Eerlijk, snel en transparant
                </h2>
                <p className="mt-6 text-[#5c6878] text-lg leading-relaxed">
                  We zagen hoe andere platforms vakmensen lieten betalen voor
                  nep-leads en ondoorzichtige abonnementen. Bij Klusblok
                  betaal je alleen voor klussen die je écht claimt. Geen
                  mollen, geen abonnementen, geen verrassingen.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "100% gratis voor klusplaatsers",
                    "Direct contact zonder tussenpersoon",
                    "Eerlijke prijzen vanaf € 6 per claim",
                    "KVK + verzekeringsverplichting voor vakmensen",
                  ].map((b) => (
                    <li key={b} className="flex items-center gap-3 text-[15px]">
                      <CheckCircle
                        size={18}
                        style={{ color: "#10b981" }}
                        className="flex-shrink-0"
                      />
                      <span className="text-[#1a2535]">{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <KvStat value="100%" label="Gratis plaatsen" />
                  <KvStat value="2u" label="Reactievenster" />
                  <KvStat value="NL" label="Heel Nederland" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[820px] mx-auto px-6 sm:px-10">
          <Reveal>
            <div className="text-center mb-12">
              <p className="kb-eyebrow" style={{ color: BLUE }}>
                Veelgestelde vragen
              </p>
              <h2
                className="kb-heading mt-3"
                style={{ fontSize: "clamp(28px, 3.5vw, 42px)" }}
              >
                Heb je een vraag?
              </h2>
              <p className="mt-4 text-[#5c6878] text-lg">
                Niet gevonden wat je zocht?{" "}
                <Link
                  href="/contact"
                  className="font-bold underline"
                  style={{ color: BLUE }}
                >
                  Stuur ons een bericht
                </Link>
                .
              </p>
            </div>
          </Reveal>
          <FaqAccordion />
        </div>
      </section>

      {/* FINAL CTA — clean dark gradient, white text crisp, smooth transition to footer */}
      <section
        className="relative py-24 lg:py-32 text-center overflow-hidden"
        style={{
          background: `linear-gradient(180deg, #1e4f70 0%, ${NAVY} 100%)`,
        }}
      >
        {/* subtle dot pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* yellow accent glow */}
        <div
          aria-hidden
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: YELLOW }}
        />
        <div className="relative max-w-3xl mx-auto px-6">
          <Reveal>
            <p
              className="kb-eyebrow"
              style={{ color: YELLOW, opacity: 1 }}
            >
              Maak het je makkelijk
            </p>
            <h2
              className="kb-heading mt-3"
              style={{
                fontSize: "clamp(32px, 4vw, 52px)",
                color: "white",
              }}
            >
              Begin vandaag nog op Klusblok
            </h2>
            <p className="mt-5 text-white text-lg">
              Of je nu een klus plaatst of een vakman bent — registreren is
              gratis en in 30 seconden klaar.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/register/consumer"
                className="btn-yellow"
                style={{ padding: "14px 28px", fontSize: "15px" }}
              >
                Plaats jouw klus <ArrowRight size={16} />
              </Link>
              <Link
                href="/register/contractor"
                className="inline-flex items-center gap-2 font-bold text-sm rounded-xl px-7 py-3.5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                  color: "white",
                  backdropFilter: "blur(4px)",
                }}
              >
                Word kluszoeker <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-white">
              <span className="flex items-center gap-2 text-sm">
                <Phone size={14} />
                <span>Direct contact, geen tussenpersoon</span>
              </span>
              <span className="flex items-center gap-2 text-sm">
                <Shield size={14} />
                <span>KVK-platform, vol bescherming</span>
              </span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function BigCtaCard({
  Icon,
  label,
  title,
  description,
  href,
  accent,
  accentText,
  primary = false,
}: {
  Icon: typeof HomeIcon;
  label: string;
  title: string;
  description: string;
  href: string;
  accent: string;
  accentText: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl p-7 lg:p-8 transition-all text-left"
      style={{
        backgroundColor: "white",
        border: `2px solid ${primary ? accent : "#e2e8f0"}`,
        boxShadow: primary
          ? `0 8px 32px ${accent}33`
          : "0 1px 2px rgba(15,37,53,0.05)",
        display: "block",
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: accent, color: accentText }}
      >
        <Icon size={26} />
      </div>
      <p
        className="text-xs font-bold uppercase tracking-wider mb-2 text-[#5c6878]"
        style={{ letterSpacing: "1.5px" }}
      >
        {label}
      </p>
      <h3
        className="kb-heading mb-2"
        style={{ fontSize: "26px", color: "#0f2535" }}
      >
        {title}
      </h3>
      <p className="text-sm text-[#5c6878] mb-5">{description}</p>
      <span
        className="inline-flex items-center gap-2 font-bold text-sm"
        style={{ color: "#0f2535" }}
      >
        Aan de slag{" "}
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

function CategoryTile({ name, img }: { name: string; img: string }) {
  return (
    <Link
      href={`/register/consumer`}
      className="group block rounded-2xl overflow-hidden relative"
      style={{
        aspectRatio: "5/4",
        boxShadow: "0 1px 2px rgba(15,37,53,0.05)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt=""
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, rgba(15,37,53,0.85) 100%)",
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p
          className="font-bold text-lg"
          style={{ fontFamily: "var(--font-heading-barlow)" }}
        >
          {name}
        </p>
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold mt-1 transition-transform group-hover:translate-x-1"
          style={{ color: YELLOW }}
        >
          Plaats klus <ArrowRight size={11} />
        </span>
      </div>
    </Link>
  );
}

function Tag({
  Icon,
  text,
}: {
  Icon: typeof CheckCircle;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-medium">
      <Icon size={14} style={{ color: BLUE }} />
      {text}
    </span>
  );
}

function TrustStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p
        className="kb-heading"
        style={{ fontSize: "26px", color: NAVY, fontWeight: 800 }}
      >
        {value}
      </p>
      <p className="text-xs text-[#5c6878] uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

function KvStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p
        className="kb-heading"
        style={{
          fontSize: "32px",
          color: BLUE,
          fontWeight: 800,
        }}
      >
        {value}
      </p>
      <p className="text-xs text-[#5c6878] uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
