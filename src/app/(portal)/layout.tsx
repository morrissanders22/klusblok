import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { VerifyBanner } from "@/components/portal/VerifyBanner";
import { ImpersonationBanner } from "@/components/portal/ImpersonationBanner";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <div
      className="fixed inset-0 flex"
      style={{ backgroundColor: "#f1f4f8" }}
    >
      <PortalSidebar />
      <div className="flex-1 flex flex-col lg:pl-[240px] min-w-0">
        <PortalTopbar />
        <main className="flex-1 overflow-y-auto">
          <ImpersonationBanner />
          <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
            <VerifyBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
