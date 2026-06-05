import Link from "next/link";
import { LogIn, Monitor, ArrowRight } from "lucide-react";

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
      {/* MAIN NAV */}
      <header
        style={{
          backgroundColor: "#1e4f70",
          boxShadow: "0 2px 12px rgba(30,79,112,0.3)",
          overflow: "visible",
        }}
        className="relative"
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-[52px] relative">
          <div className="h-[120px] flex items-center justify-between gap-6">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center"
              aria-label="Klusblok home"
            >
              <span
                className="flex items-center justify-center rounded-full shadow-lg"
                style={{
                  backgroundColor: "#f7c021",
                  width: 110,
                  height: 110,
                  border: "4px solid #1e4f70",
                  padding: 14,
                }}
              >
                <Logo size={60} variant="dark" priority />
              </span>
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
                  <Monitor size={14} /> Dashboard
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
