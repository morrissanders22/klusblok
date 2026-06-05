import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Klusblok — Dé marktplaats voor klussers",
    short_name: "Klusblok",
    description:
      "Plaats gratis je klus of vind nieuw werk als kluszoeker. Geen abonnement, pay-per-lead.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e4f70",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
