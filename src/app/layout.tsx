import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-opensans",
  display: "swap",
});
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading-barlow",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://klusblok.nl";
const SITE_NAME = "Klusblok";
const DEFAULT_TITLE =
  "Klus plaatsen of klus vinden? | Klusblok - Dé marktplaats voor klussers";
const DEFAULT_DESCRIPTION =
  "Wil je een klus plaatsen of zoek je als vakman direct werk? Klusblok verbindt huiseigenaren met ervaren klussers. Snel, simpel en betrouwbaar. Start direct!";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Klusblok",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Klus plaatsen",
    "Vakman zoeken",
    "Klusjesman gezocht",
    "Werken als zzp klusser",
    "Huis renoveren hulp",
    "Klusser inhuren",
    "Klussen marktplaats",
    "Klusblok",
  ],
  authors: [{ name: "Klusblok", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: "#1e4f70",
  width: "device-width",
  initialScale: 1,
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Klusblok",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/brand/klusblok-logo.png`,
        caption: "Klusblok",
        inLanguage: "nl-NL",
      },
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Klusblok",
      alternateName: "Klus blok",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "nl-NL",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/jobs?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl-NL" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_JSONLD),
          }}
        />
      </body>
    </html>
  );
}
