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
        <div className="max-w-[1280px] mx-auto px-4 sm:px-[52px] relative">
          <div className="h-[72px] sm:h-[100px] lg:h-[120px] flex items-center justify-between gap-3 sm:gap-6">
            <Link
              href="/"
              className="flex-shrink-0 flex items-center"
              aria-label="Klusblok home"
            >
              <span
                className="flex items-center justify-center rounded-full shadow-lg kb-nav-logo"
                style={{
                  backgroundColor: "#f7c021",
                  border: "3px solid #1e4f70",
                }}
              >
                <Logo
                  size={36}
                  variant="dark"
                  priority
                  className="kb-nav-logo-img"
                />
              </span>
            </Link>

            <nav className="hidden lg:flex gap-1 items-center">
              {NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="kb-nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex gap-2 sm:gap-2.5 items-center">
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="btn-yellow text-[12px] sm:text-[13px] !px-3 sm:!px-5 !py-2 sm:!py-2.5"
                >
                  <Monitor size={14} /> Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="btn-outline text-[12px] sm:text-[13px] !px-3 sm:!px-5 !py-2 sm:!py-2.5"
                  >
                    <LogIn size={14} /> Login
                  </Link>
                  <Link
                    href="/jobs/new"
                    className="btn-yellow text-[12px] sm:text-[13px] !px-3 sm:!px-5 !py-2 sm:!py-2.5"
                  >
                    <span className="hidden sm:inline">Plaats klus</span>
                    <span className="sm:hidden">Klus</span>{" "}
                    <ArrowRight size={14} />
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
