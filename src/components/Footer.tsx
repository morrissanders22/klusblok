import Link from "next/link";
import { Logo } from "./Logo";

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Vind een klus", href: "/jobs" },
  { label: "Plaats je klus", href: "/jobs/new" },
  { label: "Hoe werkt het", href: "/hoe-werkt-het" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#0f2535",
        borderTop: "3px solid #f6b42c",
        padding: "40px 24px",
      }}
    >
      <div className="max-w-[1280px] mx-auto flex justify-between items-center flex-wrap gap-5">
        <div className="flex items-center gap-3">
          <Logo size={24} variant="light" />
          <span
            style={{
              fontSize: "9px",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
            className="hidden sm:inline"
          >
            Hét klus platform
          </span>
        </div>
        <div className="flex gap-7 flex-wrap">
          {FOOTER_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}
              className="hover:!text-white/75 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}
          className="w-full sm:w-auto text-center sm:text-right"
        >
          © {new Date().getFullYear()} Klusblok.nl · Alle rechten voorbehouden ·{" "}
          <Link
            href="/admin-login"
            style={{ color: "rgba(255,255,255,0.25)" }}
            className="hover:!text-[#f6b42c] transition-colors"
          >
            Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
