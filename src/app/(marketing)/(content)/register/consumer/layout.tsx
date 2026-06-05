import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account aanmaken als klusplaatser",
  description:
    "Plaats gratis je klus op Klusblok. Maak in 2 minuten een particulier account aan en ontvang reacties van vakmensen uit jouw regio.",
  alternates: { canonical: "/register/consumer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
