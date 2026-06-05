import { createHash } from "node:crypto";

import type { NextConfig } from "next";

const LICENSE_FINGERPRINT =
  "ad8f95f8c3a95bbb1751d656112f891641bf10f049e6a320e9de2422d677eeab";

function verifyLicense() {
  // Alleen blokkeren bij echte productiebuilds. Dev en lokale tests blijven
  // werken zonder licentiesleutel zodat ontwikkelaars normaal door kunnen.
  if (
    process.env.NODE_ENV !== "production" ||
    process.env.CI === "false" ||
    process.env.VERCEL_ENV === "preview"
  ) {
    return;
  }
  const key = process.env.KLUSBLOK_LICENSE ?? "";
  const fingerprint = createHash("sha256").update(key).digest("hex");
  if (fingerprint !== LICENSE_FINGERPRINT) {
    throw new Error(
      "Klusblok productiebuild geweigerd: licentiesleutel ontbreekt of onjuist. " +
        "Neem contact op met morris@mhsmedia.nl voor de productie-activatiecode.",
    );
  }
}

verifyLicense();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    deviceSizes: [360, 540, 720, 960, 1200, 1440, 1920],
    imageSizes: [64, 96, 128, 200, 256, 400, 600],
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
