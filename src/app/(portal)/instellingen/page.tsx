import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  ProfileForm,
  BusinessForm,
  PasswordForm,
} from "./SettingsForms";
import { ProfileFotoForm } from "./ProfileFotoForm";

export const dynamic = "force-dynamic";

export default async function InstellingenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/instellingen");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      city: true,
      postalCode: true,
      address: true,
      companyName: true,
      kvkNumber: true,
      hasLiabilityInsurance: true,
      insuranceConfirmedAt: true,
      serviceRadiusKm: true,
      role: true,
      bio: true,
      photoUrl: true,
      specialties: true,
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl space-y-8">
      <header>
        <p className="kb-eyebrow flex items-center gap-2">
          <Settings size={12} /> Instellingen
        </p>
        <h1 className="kb-heading text-3xl sm:text-4xl mt-2">
          Mijn account
        </h1>
        <p className="text-[#5c6878] mt-2">
          Beheer je profielgegevens, bedrijfsgegevens en wachtwoord.
        </p>
      </header>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-1">Profielgegevens</h2>
        <p className="text-sm text-[#5c6878] mb-5">
          Naam, telefoonnummer en adres. Adres is alleen zichtbaar voor de
          klusser die jouw klus claimt.
        </p>
        <ProfileForm
          defaults={{
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            city: user.city ?? "",
            postalCode: user.postalCode ?? "",
            address: user.address ?? "",
            serviceRadiusKm: user.serviceRadiusKm,
          }}
          showServiceRadius={user.role === "CONTRACTOR"}
        />
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-1">Klusser-profiel</h2>
        <p className="text-sm text-[#5c6878] mb-5">
          Profielfoto, bio en specialiteiten. Dit zien kluszoekers in de
          klusser-overzichten.
        </p>
        <ProfileFotoForm
          defaults={{
            bio: user.bio ?? "",
            photoUrl: user.photoUrl ?? "",
            specialties: user.specialties ?? [],
          }}
        />
      </section>

      <section className="kb-panel" id="verzekering">
        <h2 className="kb-heading text-xl mb-1">Bedrijfsgegevens & verzekering</h2>
        <p className="text-sm text-[#5c6878] mb-5">
          KVK-nummer is verplicht. Rechtsbijstandsverzekering is verplicht na
          de eerste 30 dagen — bevestig hier zodra je 'm hebt.
        </p>
        <BusinessForm
          defaults={{
            companyName: user.companyName ?? "",
            kvkNumber: user.kvkNumber ?? "",
            hasLiabilityInsurance: user.hasLiabilityInsurance,
          }}
        />
      </section>

      <section className="kb-panel">
        <h2 className="kb-heading text-xl mb-1">Wachtwoord wijzigen</h2>
        <p className="text-sm text-[#5c6878] mb-5">
          Gebruik minimaal 8 tekens.
        </p>
        <PasswordForm />
      </section>
    </div>
  );
}
