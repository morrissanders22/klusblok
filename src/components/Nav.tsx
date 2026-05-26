import Link from "next/link";
import {
  Mail,
  MapPin,
  Star,
  LogIn,
  Monitor,
  ArrowRight,
} from "lucide-react";

import { auth } from "@/auth";
import { Logo } from "./Logo";

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Vind een klus", href: "/jobs" },
  { label: "Plaats je klus", href: "/jobs/new" },
  { label: "Vind kluszoekers", href: "/klussers" },
  { label: "Hoe werkt klusblok", href: "/hoe-werkt-het" },
  { label: "Contact", href: "/contact" },
];

export async function Nav() {
  const session = await auth();

  return (
    <div className="sticky top-0 z-50">
      {/* TOPBAR */}
      <div
        style={{
          backgroundColor: "#1e4f70",
          color: "rgba(255,255,255,0.55)",
          fontSize: "12px",
          padding: "8px 24px",
        }}
        className="flex justify-between items-center flex-wrap gap-2 sm:px-[52px]"
      >
        <div className="flex gap-5">
          <a
            href="mailto:info@klusblok.nl"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail size={11} /> info@klusblok.nl
          </a>
          <span className="hidden sm:flex items-center gap-1.5">
            <MapPin size={11} /> Nederland
          </span>
        </div>
        <div className="flex gap-1.5 items-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={10} fill="#f6b42c" color="#f6b42c" />
          ))}
          <span className="ml-1 text-white font-bold text-xs">
            Vakmannen door heel Nederland
          </span>
        </div>
      </div>

      {/* MAIN NAV */}
      <header
        style={{
          backgroundColor: "#1e4f70",
          boxShadow: "0 2px 12px rgba(30,79,112,0.3)",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-[52px]">
          <div className="h-[70px] flex items-center justify-between gap-6">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Logo size={28} variant="light" />
            </Link>

            <nav className="hidden lg:flex gap-1 items-center">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="kb-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex gap-2.5 items-center">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="btn-yellow"
                  style={{ padding: "10px 22px", fontSize: "13px" }}
                >
                  <Monitor size={14} /> Naar software
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-outline"
                    style={{ padding: "10px 20px", fontSize: "13px" }}
                  >
                    <LogIn size={14} /> Login
                  </Link>
                  <Link
                    href="/jobs/new"
                    className="btn-yellow"
                    style={{ padding: "10px 22px", fontSize: "13px" }}
                  >
                    Plaats jouw klus <ArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
