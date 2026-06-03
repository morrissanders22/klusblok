import { UserCog } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { adminStopImpersonating } from "@/app/(portal)/admin/klanten/actions";

export async function ImpersonationBanner() {
  const session = await auth();
  const adminId = session?.user?.impersonatedBy;
  if (!adminId) return null;

  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { name: true },
  });

  return (
    <div
      className="sticky top-0 z-40"
      style={{
        backgroundColor: "#1a2535",
        borderBottom: "2px solid #f7c021",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white flex items-center gap-2">
          <UserCog size={15} style={{ color: "#f7c021" }} />
          <span>
            Je bent ingelogd als{" "}
            <strong>{session.user.name}</strong>
            {admin?.name ? (
              <span className="opacity-70">
                {" "}
                — admin-sessie van {admin.name}
              </span>
            ) : null}
          </span>
        </p>
        <form action={adminStopImpersonating}>
          <button
            type="submit"
            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors"
            style={{ backgroundColor: "#f7c021", color: "#1a2535" }}
          >
            Terug naar admin
          </button>
        </form>
      </div>
    </div>
  );
}
