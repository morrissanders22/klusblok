import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminTabs } from "@/components/admin/AdminTabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-2">
      <AdminTabs />
      {children}
    </div>
  );
}
