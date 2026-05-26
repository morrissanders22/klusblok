import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";

import { auth } from "@/auth";
import { NewUserForm } from "./NewUserForm";

export const dynamic = "force-dynamic";

export default async function NewKlantPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="max-w-xl">
      <Link
        href="/admin/klanten/klussers"
        className="inline-flex items-center gap-1 text-sm text-[#5c6878] hover:text-[#3586b6] mb-4"
      >
        <ArrowLeft size={14} /> Klantenoverzicht
      </Link>
      <header className="mb-6">
        <p className="kb-eyebrow flex items-center gap-2">
          <UserPlus size={12} /> Nieuwe klant
        </p>
        <h1 className="kb-heading text-3xl mt-2">Klant handmatig aanmaken</h1>
        <p className="text-[#5c6878] mt-2 text-sm">
          Account wordt automatisch geverifieerd. Klusser-accounts krijgen
          ook insurance-bevestiging.
        </p>
      </header>
      <div className="kb-panel">
        <NewUserForm />
      </div>
    </div>
  );
}
