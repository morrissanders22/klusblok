import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { fetchMollieStatus } from "@/lib/payments";
import { activateClaim } from "@/app/(portal)/jobs/[id]/actions";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const providerRef = form.get("id");
  if (typeof providerRef !== "string") {
    return NextResponse.json({ error: "missing id" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { providerRef },
  });
  if (!payment) return NextResponse.json({ ok: true });

  const status = await fetchMollieStatus(providerRef);
  if (status === payment.status) return NextResponse.json({ ok: true });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : payment.paidAt,
    },
  });

  if (status === "PAID") {
    await activateClaim(payment.claimId);
  }

  return NextResponse.json({ ok: true });
}
