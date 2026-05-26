import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Star,
  Hammer,
  Home as HomeIcon,
  Users,
  ClipboardList,
  Search,
  User,
  Euro,
  MapPin,
  Mail,
} from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { KlussenGrid, type KlusItem } from "@/components/home/KlussenGrid";
import { prisma } from "@/lib/db";
import { formatEuro } from "@/lib/services";

export const dynamic = "force-dynamic";

const YELLOW = "#f6b42c";
const DARK_BLUE = "#3586b6";
const DARK = "#1a2535";
const LIGHT = "#f4f7fa";
const GRAY = "#5c6878";

const STEPS = [
  {
    num: "01",
    title: "Maak een account aan",
    desc: "Registreer gratis als particulier of als klusser op Klusblok.",
    Icon: User,
  },
  {
    num: "02",
    title: "Plaats of vind een klus",
    desc: "Beschrijf je klus in detail met foto's, of blader door beschikbare opdrachten.",
    Icon: ClipboardList,
  },
  {
    num: "03",
    title: "Aan de slag!",
    desc: "Direct contact na claim — de klusser belt jou binnen 2 uur en het werk kan beginnen.",
    Icon: Hammer,
  },
];

const USPS = [
  { Icon: CheckCircle, txt: "Gratis klus plaatsen" },
  { Icon: Users, txt: "KVK-geverifieerde klussers" },
  { Icon: Search, txt: "Snel de juiste match" },
  { Icon: Euro, txt: "Geen abonnement — pay-per-lead" },
];

export default async function Home() {
  const recent = await prisma.job
    .findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { services: { take: 1 } },
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
    <div style={{ backgroundColor: "#fff", color: DARK }}>
      {/* HERO */}
      <section
        style={{
          background:
            "linear-gradient(135deg, #1e4f70 0%, #3586b6 60%, #1a3a55 100%)",
          minHeight: "90vh",
          position: "relative",
          overflow: "hidden",
        }}
        className="flex items-center"
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 70% 50%, rgba(246,180,44,0.10) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            backgroundImage:
              "url(https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
          }}
        />

        <div
          className="max-w-[1280px] mx-auto w-full relative z-10"
          style={{ padding: "80px 24px" }}
        >
          <div className="max-w-[660px]">
            <div
              className="h-anim-1 inline-flex items-center gap-2"
              style={{
                backgroundColor: "rgba(245,200,0,0.15)",
                border: "1px solid rgba(245,200,0,0.4)",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 700,
                color: YELLOW,
                marginBottom: "28px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              🔨 Hét klus platform van Nederland
            </div>
            <h1
              className="h-anim-2"
              style={{
                fontSize: "clamp(44px, 6vw, 80px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.0,
                fontFamily: "var(--font-heading-barlow)",
                textTransform: "uppercase",
                marginBottom: "24px",
              }}
            >
              Plaats jouw klus.
            </h1>
            <p
              className="h-anim-3"
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.75)",
                lineHeight: 1.8,
                fontWeight: 400,
                marginBottom: "40px",
                maxWidth: "520px",
              }}
            >
              Klusblok verbindt particulieren met vakkundige klussers. Geen
              abonnementen, geen "mollen" — een klusser betaalt alleen voor
              klussen die hij écht claimt.
            </p>
            <div className="h-anim-4 flex gap-3.5 flex-wrap mb-14">
              <Link href="/jobs/new" className="btn-yellow">
                Plaats jouw klus <ArrowRight size={16} />
              </Link>
              <Link href="/register/contractor" className="btn-outline">
                Ik ben een klusser
              </Link>
            </div>
            <div className="h-anim-5 flex gap-11 flex-wrap">
              {[
                ["100%", "Gratis plaatsen"],
                ["€ 6 – € 40", "Per claim — geen abonnement"],
                ["2 uur", "Reactie-venster"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color: YELLOW,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.45)",
                      marginTop: "4px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating cards (desktop only) */}
        <div
          className="hidden xl:flex flex-col gap-4 absolute"
          style={{
            right: "80px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "300px",
          }}
        >
          <div
            style={{
              background: YELLOW,
              borderRadius: "16px",
              padding: "22px 24px",
              animation: "heroFadeIn 0.7s ease 1.1s both",
            }}
          >
            <div className="flex items-center gap-2.5 mb-2 text-white">
              <HomeIcon size={20} />
              <span className="font-extrabold text-base">Particulier?</span>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "white",
                opacity: 0.9,
                lineHeight: 1.5,
                marginBottom: "14px",
              }}
            >
              Plaats gratis jouw klus en ontvang reacties van vakmensen.
            </p>
            <Link
              href="/jobs/new"
              className="flex items-center gap-1 text-white text-sm font-bold"
            >
              Ga nu aan de slag <ArrowRight size={14} />
            </Link>
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "16px",
              padding: "22px 24px",
              backdropFilter: "blur(10px)",
              animation: "heroFadeIn 0.7s ease 1.25s both",
            }}
          >
            <div className="flex items-center gap-2.5 mb-2 text-white">
              <Hammer size={20} />
              <span className="font-extrabold text-base">Klusser?</span>
            </div>
            <p
              style={{
                fontSize: "13px",
                color: "white",
                opacity: 0.7,
                lineHeight: 1.5,
                marginBottom: "14px",
              }}
            >
              Vanaf € 6 per klus. Geen abonnement, je betaalt alleen voor
              claims die je oppakt.
            </p>
            <Link
              href="/register/contractor"
              className="flex items-center gap-1 text-white text-sm font-bold"
            >
              Word klusser <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* USP STRIP */}
      <div
        style={{
          backgroundColor: YELLOW,
          padding: "20px 24px",
        }}
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-0">
          {USPS.map(({ Icon, txt }, i) => (
            <div
              key={txt}
              style={{
                borderRight:
                  i < USPS.length - 1
                    ? "1px solid rgba(26,35,64,0.15)"
                    : "none",
              }}
              className="flex items-center gap-2.5 px-3 sm:px-5 py-2"
            >
              <span style={{ color: DARK_BLUE }} className="flex-shrink-0">
                <Icon size={18} />
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: DARK_BLUE,
                  fontWeight: 700,
                }}
              >
                {txt}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section
        style={{ padding: "96px 24px", backgroundColor: LIGHT }}
      >
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: DARK_BLUE,
                  fontWeight: 700,
                  marginBottom: "10px",
                  opacity: 0.6,
                }}
              >
                Eenvoudig & Snel
              </div>
              <h2
                style={{
                  fontSize: "clamp(32px,4vw,52px)",
                  fontWeight: 800,
                  color: DARK,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-heading-barlow)",
                }}
              >
                Hoe werkt Klusblok?
              </h2>
              <p
                style={{
                  fontSize: "16px",
                  color: GRAY,
                  marginTop: "12px",
                  fontWeight: 300,
                  maxWidth: "480px",
                  margin: "12px auto 0",
                }}
              >
                In drie eenvoudige stappen verbinden we particulieren met de
                juiste vakman.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 120} dir="up">
                <div
                  style={{
                    background: "white",
                    border: "1px solid #e8ecf2",
                    borderRadius: "20px",
                    padding: "36px 32px",
                  }}
                  className="relative h-full hover:-translate-y-1.5 hover:shadow-xl transition-all"
                >
                  <div
                    style={{
                      fontSize: "64px",
                      fontWeight: 900,
                      color: `${DARK_BLUE}08`,
                      lineHeight: 1,
                      position: "absolute",
                      top: "16px",
                      right: "24px",
                      letterSpacing: "-3px",
                    }}
                  >
                    {step.num}
                  </div>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: YELLOW,
                      color: DARK_BLUE,
                    }}
                    className="flex items-center justify-center mb-5"
                  >
                    <step.Icon size={24} />
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: DARK,
                      marginBottom: "10px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: GRAY,
                      lineHeight: 1.7,
                      fontWeight: 400,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400}>
            <div className="text-center mt-12">
              <Link href="/hoe-werkt-het" className="btn-dark">
                Meer weten? <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DUAL CTA */}
      <section className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "480px" }}>
        <Reveal dir="left" style={{ position: "relative", overflow: "hidden" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url(https://images.unsplash.com/photo-1503507739298-dce173d09653?w=800&q=80)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.3)",
            }}
          />
          <div
            className="relative z-10 h-full flex flex-col justify-center"
            style={{ padding: "72px 48px" }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: YELLOW,
                color: DARK_BLUE,
              }}
              className="flex items-center justify-center mb-6"
            >
              <HomeIcon size={24} />
            </div>
            <h2
              style={{
                fontSize: "clamp(32px,4vw,52px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.0,
                marginBottom: "16px",
                fontFamily: "var(--font-heading-barlow)",
                textTransform: "uppercase",
              }}
            >
              Hulp nodig
              <br />
              in huis?
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.75,
                fontWeight: 300,
                marginBottom: "36px",
                maxWidth: "360px",
              }}
            >
              Beschrijf je klus, ontvang reacties van vakkundige klussers en
              kies de beste optie voor jou.{" "}
              <strong style={{ color: YELLOW }}>100% gratis</strong> voor
              particulieren.
            </p>
            <div className="flex flex-col gap-3 mb-9">
              {[
                "Gratis klus plaatsen",
                "KVK-geverifieerde klussers",
                "Reactie binnen 2 uur",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5"
                  style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  <CheckCircle size={16} color={YELLOW} /> {item}
                </div>
              ))}
            </div>
            <Link
              href="/jobs/new"
              className="btn-yellow"
              style={{ width: "fit-content" }}
            >
              Plaats jouw klus <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>

        <Reveal dir="right">
          <div
            style={{
              background: "linear-gradient(135deg, #1e4f70 0%, #3586b6 100%)",
              padding: "72px 48px",
            }}
            className="h-full flex flex-col justify-center"
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                background: "rgba(245,200,0,0.15)",
                border: "1px solid rgba(245,200,0,0.3)",
                color: YELLOW,
              }}
              className="flex items-center justify-center mb-6"
            >
              <Hammer size={24} />
            </div>
            <h2
              style={{
                fontSize: "clamp(32px,4vw,52px)",
                fontWeight: 800,
                color: "white",
                lineHeight: 1.0,
                marginBottom: "16px",
                fontFamily: "var(--font-heading-barlow)",
                textTransform: "uppercase",
              }}
            >
              Ben jij
              <br />
              een klusser?
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.75,
                fontWeight: 300,
                marginBottom: "36px",
                maxWidth: "360px",
              }}
            >
              Geen abonnement, alleen betalen voor klussen die je écht
              oppakt. Vanaf € 6 per claim, transparant en eerlijk.
            </p>
            <div
              style={{
                background: "rgba(245,200,0,0.1)",
                border: "1px solid rgba(245,200,0,0.25)",
                borderRadius: "12px",
                padding: "20px 24px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: YELLOW,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                Tarieven per claim
              </div>
              <div className="grid grid-cols-2 gap-3 text-white">
                {[
                  ["€ 6", "Kleine klus"],
                  ["€ 10", "Standaard"],
                  ["€ 20", "Grote klus"],
                  ["€ 40", "Project (3+ diensten)"],
                ].map(([price, label]) => (
                  <div key={label}>
                    <span
                      style={{
                        fontSize: "22px",
                        fontWeight: 900,
                        color: YELLOW,
                      }}
                    >
                      {price}
                    </span>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.55)",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/register/contractor"
              className="btn-yellow"
              style={{ width: "fit-content" }}
            >
              Maak klusser-account <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* RECENTE KLUSSEN */}
      <section style={{ padding: "96px 24px", backgroundColor: "white" }}>
        <div className="max-w-[1280px] mx-auto">
          <Reveal>
            <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: DARK_BLUE,
                    fontWeight: 700,
                    marginBottom: "8px",
                    opacity: 0.6,
                  }}
                >
                  Live op het platform
                </div>
                <h2
                  style={{
                    fontSize: "clamp(30px,4vw,48px)",
                    fontWeight: 800,
                    color: DARK,
                    textTransform: "uppercase",
                    fontFamily: "var(--font-heading-barlow)",
                  }}
                >
                  Recente klussen 🔨
                </h2>
              </div>
              <Link
                href="/jobs"
                style={{
                  color: DARK_BLUE,
                  borderBottom: `2px solid ${DARK_BLUE}`,
                }}
                className="flex items-center gap-1.5 text-sm font-bold"
              >
                Bekijk alle klussen <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>

          {klussen.length === 0 ? (
            <p className="text-[#5c6878] text-center py-8">
              Nog geen open klussen. Wees de eerste!{" "}
              <Link
                href="/jobs/new"
                className="text-[#3586b6] font-bold underline"
              >
                Plaats jouw klus
              </Link>
              .
            </p>
          ) : (
            <KlussenGrid items={klussen} />
          )}
        </div>
      </section>

      {/* WIE ZIJN WIJ */}
      <section
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ minHeight: "500px" }}
      >
        <Reveal
          dir="left"
          style={{ overflow: "hidden", position: "relative" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80"
            alt="Klusser aan het werk"
            className="w-full h-full object-cover"
            style={{ minHeight: "300px" }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(13,17,23,0.15)",
            }}
          />
        </Reveal>
        <Reveal dir="right">
          <div
            style={{ backgroundColor: "#f8fafc", padding: "72px 48px" }}
            className="h-full flex flex-col justify-center"
          >
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: DARK_BLUE,
                fontWeight: 700,
                marginBottom: "14px",
                opacity: 0.6,
              }}
            >
              Over ons
            </div>
            <h2
              style={{
                fontSize: "clamp(30px,4vw,52px)",
                fontWeight: 800,
                color: DARK,
                lineHeight: 1.05,
                marginBottom: "20px",
                fontFamily: "var(--font-heading-barlow)",
                textTransform: "uppercase",
              }}
            >
              Wie zijn wij?
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: GRAY,
                lineHeight: 1.85,
                fontWeight: 400,
                marginBottom: "20px",
              }}
            >
              Klusblok is de eerlijke marktplaats voor klussen. We zagen hoe
              andere platforms vakmensen lieten betalen voor nep-leads en
              ondoorzichtige abonnementen. Bij ons betaal je alleen voor klussen
              die je écht claimt.
            </p>
            <p
              style={{
                fontSize: "16px",
                color: GRAY,
                lineHeight: 1.85,
                fontWeight: 400,
                marginBottom: "32px",
              }}
            >
              Onze klussers zijn vakmensen in loodgieterswerk, elektriciteit,
              timmerwerk, schilderwerk en nog veel meer — KVK-geregistreerd en
              voorzien van een rechtsbijstandsverzekering.
            </p>
            <div className="flex gap-9 mb-9 flex-wrap">
              {[
                ["100%", "Gratis plaatsen"],
                ["2 uur", "Reactievenster"],
                ["NL", "Heel Nederland"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color: DARK_BLUE,
                    }}
                  >
                    {num}
                  </div>
                  <div style={{ fontSize: "11px", color: GRAY, marginTop: "3px" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/hoe-werkt-het"
              className="btn-dark"
              style={{ width: "fit-content" }}
            >
              Meer over Klusblok <ArrowRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section style={{ padding: "96px 24px", backgroundColor: "white" }}>
        <div className="max-w-[800px] mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: DARK_BLUE,
                  fontWeight: 700,
                  marginBottom: "10px",
                  opacity: 0.6,
                }}
              >
                Veelgestelde vragen
              </div>
              <h2
                style={{
                  fontSize: "clamp(30px,4vw,50px)",
                  fontWeight: 800,
                  color: DARK,
                  textTransform: "uppercase",
                  fontFamily: "var(--font-heading-barlow)",
                }}
              >
                Heb je een vraag?
              </h2>
            </div>
          </Reveal>
          <FaqAccordion />
        </div>
      </section>

      {/* CONTACT CTA */}
      <section
        style={{
          background: "linear-gradient(135deg, #1e4f70 0%, #3586b6 100%)",
          padding: "88px 24px",
        }}
        className="text-center"
      >
        <Reveal dir="up">
          <div className="max-w-[640px] mx-auto">
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: YELLOW,
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              Klaar om te beginnen?
            </div>
            <h2
              style={{
                fontSize: "clamp(34px,5vw,60px)",
                fontWeight: 800,
                color: "white",
                marginBottom: "14px",
                fontFamily: "var(--font-heading-barlow)",
                textTransform: "uppercase",
              }}
            >
              Start vandaag nog
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.8,
                fontWeight: 300,
                marginBottom: "44px",
              }}
            >
              Particulier of klusser — iedereen is welkom op Klusblok. Maak
              gratis een account aan en ga direct aan de slag.
            </p>
            <div className="flex gap-3.5 justify-center flex-wrap mb-10">
              <Link href="/jobs/new" className="btn-yellow">
                Plaats jouw klus <ArrowRight size={16} />
              </Link>
              <Link href="/register/contractor" className="btn-outline">
                Klusser worden
              </Link>
            </div>
            <div className="flex justify-center flex-wrap">
              <a
                href="mailto:info@klusblok.nl"
                style={{ color: "rgba(255,255,255,0.55)" }}
                className="flex items-center gap-2 text-sm hover:!text-white transition-colors"
              >
                <Mail size={16} /> info@klusblok.nl
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
