import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aanmelden als kluszoeker (KVK)",
  description:
    "Werk vinden als vakman? Maak een zakelijk Klusblok-account aan met KVK-verificatie en reageer direct op open klussen. Pay-per-lead, geen abonnement.",
  alternates: { canonical: "/register/contractor" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
