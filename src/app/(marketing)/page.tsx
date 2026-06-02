import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Hammer,
  Home as HomeIcon,
  Sparkles,
  Clock,
  Euro,
} from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { KlussenGrid, type KlusItem } from "@/components/home/KlussenGrid";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const YELLOW = "#fcc419";
const BLUE = "#3586b6";

const STEPS = [
  {
    num: "01",
    title: "Maak gratis een account",
    desc: "Als klusplaatser of als kluszoeker. Geen abonnement, geen verborgen kosten.",
  },
  {
    num: "02",
    title: "Plaats of vind een klus",
    desc: "Beschrijf je klus met foto's, of blader door beschikbare opdrachten in jouw regio.",
  },
  {
    num: "03",
    title: "Aan de slag binnen 2 uur",
    desc: "De kluszoeker neemt direct contact met je op na het claimen.",
  },
];

export default async function Home() {
  const recent = await prisma.job
    .findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        services: { take: 1 },
      },
    })
    .catch(() => []);

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
      {/* HERO — light, airy, with two prominent CTAs */}
      <section
        style={{ backgroundColor: "#f7f9fc" }}
        className="overflow-hidden"
      >
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <Reveal delay={0}>
                <p
                  className="kb-eyebrow inline-flex items-center gap-2"
                  style={{ color: BLUE }}
                >
                  <Sparkles size={12} /> Welkom bij Klusblok
                </p>
              </Reveal>
              <Reveal delay={100}>
                <h1
                  className="kb-heading mt-3"
                  style={{
                    fontSize: "clamp(40px, 5.5vw, 64px)",
                    lineHeight: 1.05,
                    color: "#0f2535",
                  }}
                >
                  Jouw klus plaatsen
                  <br />
                  <span style={{ color: BLUE }}>of vindt jouw klus</span>
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-5 text-lg text-[#5c6878] leading-relaxed max-w-lg">
                  De eerlijke marktplaats voor klussen. Geen abonnement, geen
                  verborgen kosten. Plaats gratis je klus of vind nieuw werk
                  bij jou in de buurt.
                </p>
              </Reveal>

              {/* Two prominent CTA cards directly at top */}
              <Reveal delay={300}>
                <div className="mt-10 grid sm:grid-cols-2 gap-4">
                  <CtaCard
                    Icon={HomeIcon}
                    label="Klusplaatser"
                    title="Hulp nodig bij een klus?"
                    description="Plaats gratis je klus en ontvang reacties van vakmensen."
                    href="/register/consumer"
                    cta="Plaats jouw klus"
                  />
                  <CtaCard
                    Icon={Hammer}
                    label="Kluszoeker"
                    title="Op zoek naar werk?"
                    description="Bekijk open klussen in je regio en betaal alleen per claim."
                    href="/register/contractor"
                    cta="Vind jouw klus"
                  />
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-[#5c6878]">
                  <Tag Icon={CheckCircle} text="100% gratis plaatsen" />
                  <Tag Icon={Euro} text="Vanaf € 6 per claim" />
                  <Tag Icon={Clock} text="2-uur reactievenster" />
                </div>
              </Reveal>
            </div>

            {/* Hero illustration / floating mockup */}
            <Reveal delay={200} dir="right">
              <div className="hidden lg:block relative">
                <div
                  className="absolute inset-0 rounded-[40px] -rotate-2"
                  style={{ backgroundColor: "#eff6fc" }}
                />
                <div
                  className="relative rounded-[32px] overflow-hidden"
                  style={{
                    aspectRatio: "4 / 5",
                    boxShadow: "0 30px 80px rgba(15,37,53,0.18)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent 30%, rgba(15,37,53,0.5) 100%)",
                    }}
                  />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p
                      className="kb-eyebrow"
                      style={{ color: YELLOW, opacity: 1 }}
                    >
                      Live klus
                    </p>
                    <p
                      className="font-bold text-lg mt-1"
                      style={{ fontFamily: "var(--font-heading-barlow)" }}
                    >
                      Badkamer renovatie
                    </p>
                    <p className="text-sm opacity-80">Utrecht · 4 foto&apos;s</p>
                  </div>
                </div>
                {/* floating badge */}
                <div
                  className="absolute -top-4 -right-4 rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 bg-white"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: YELLOW, color: "#0f2535" }}
                  >
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-[#5c6878]">Verzekerd</p>
                    <p className="font-bold text-sm text-[#1a2535]">
                      KVK-platform
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — light, very airy */}
      <section className="bg-white py-20 lg:py-28">
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
          <div className="grid sm:grid-cols-3 gap-6 lg:gap-10">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 120}>
                <div className="relative">
                  <div
                    className="absolute -top-2 -right-2 font-extrabold leading-none"
                    style={{
                      fontFamily: "var(--font-heading-barlow)",
                      fontSize: "5rem",
                      color: "#f1f5f9",
                    }}
                  >
                    {s.num}
                  </div>
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: YELLOW, color: "#0f2535" }}
                    >
                      <span
                        className="font-extrabold text-lg"
                        style={{ fontFamily: "var(--font-heading-barlow)" }}
                      >
                        {s.num}
                      </span>
                    </div>
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
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "#f7f9fc" }}
      >
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

      {/* DUAL CTA BANNER — lichter dan voorheen */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10">
          <Reveal>
            <div
              className="rounded-3xl p-10 lg:p-16 grid lg:grid-cols-[1.5fr_1fr] gap-10 lg:gap-16 items-center"
              style={{
                backgroundColor: "#eff6fc",
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
                    color: "#0f2535",
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
                  Aan jij in 3 simpele stappen de huiseigenaar door Klusblok!
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
                    color: "#0f2535",
                    border: "1.5px solid #0f2535",
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
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[900px] mx-auto px-6 sm:px-10 text-center">
          <Reveal>
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
              nep-leads en ondoorzichtige abonnementen. Bij Klusblok betaal je
              alleen voor klussen die je écht claimt. Geen mollen, geen
              abonnementen, geen verrassingen.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-6 text-center">
              <KvStat value="100%" label="Gratis plaatsen" />
              <KvStat value="2u" label="Reactievenster" />
              <KvStat value="NL" label="Heel Nederland" />
              <KvStat value="0" label="Abonnementen" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-20 lg:py-28"
        style={{ backgroundColor: "#f7f9fc" }}
      >
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
            </div>
          </Reveal>
          <FaqAccordion />
        </div>
      </section>
    </div>
  );
}

function CtaCard({
  Icon,
  label,
  title,
  description,
  href,
  cta,
}: {
  Icon: typeof HomeIcon;
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl p-6 transition-all"
      style={{
        backgroundColor: "white",
        border: "1.5px solid #e2e8f0",
        display: "block",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#eff6fc", color: "#3586b6" }}
        >
          <Icon size={20} />
        </div>
        <p
          className="kb-eyebrow !opacity-100"
          style={{ color: "#5c6878", letterSpacing: "1.5px" }}
        >
          {label}
        </p>
      </div>
      <p
        className="font-bold mb-2 text-[#0f2535]"
        style={{ fontFamily: "var(--font-heading-barlow)", fontSize: "18px" }}
      >
        {title}
      </p>
      <p className="text-sm text-[#5c6878] mb-5 leading-relaxed">
        {description}
      </p>
      <span
        className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
        style={{ color: "#0f2535" }}
      >
        {cta}{" "}
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </span>
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
    <span className="inline-flex items-center gap-1.5">
      <Icon size={14} style={{ color: BLUE }} />
      {text}
    </span>
  );
}

function KvStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p
        className="kb-heading"
        style={{
          fontSize: "36px",
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
