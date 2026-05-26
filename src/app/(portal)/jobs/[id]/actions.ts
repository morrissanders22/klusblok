"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createMolliePayment } from "@/lib/payments";
import { computeExpiry, expireStaleClaims } from "@/lib/claims";
import { sendNotification } from "@/lib/notifications";

export type ClaimResult = { error?: string } | undefined;

export async function startClaim(
  _prev: ClaimResult,
  formData: FormData,
): Promise<ClaimResult> {
  const session = await auth();
  const jobId = formData.get("jobId") as string;
  if (!session?.user) redirect(`/login?next=/jobs/${jobId}`);

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      kvkNumber: true,
      emailVerified: true,
      createdAt: true,
      insuranceConfirmedAt: true,
    },
  });
  if (!me?.emailVerified) {
    return { error: "Bevestig eerst je e-mailadres om klussen te kunnen claimen." };
  }
  if (!me.kvkNumber) {
    redirect(`/word-klusser?next=/jobs/${jobId}`);
  }
  const { insuranceRequired } = await import("@/lib/insurance");
  if (insuranceRequired(me.createdAt, me.insuranceConfirmedAt) === "blocked") {
    return {
      error:
        "Grace-periode voorbij. Voeg eerst je rechtsbijstandsverzekering toe via Instellingen.",
    };
  }

  await expireStaleClaims(jobId);

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return { error: "Klus niet gevonden" };
  if (job.status !== "OPEN") return { error: "Deze klus is niet meer open" };
  if (job.consumerId === session.user.id) {
    return { error: "Je kunt niet je eigen klus claimen" };
  }

  const claim = await prisma.jobClaim.create({
    data: {
      jobId,
      contractorId: session.user.id,
      priceCents: job.priceCents,
      status: "PENDING_PAYMENT",
    },
  });

  const payment = await createMolliePayment({
    claimId: claim.id,
    amountCents: job.priceCents,
    description: `Klusblok lead: ${job.title}`,
  });

  redirect(payment.checkoutUrl);
}

export async function confirmByContractor(claimId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const claim = await prisma.jobClaim.findUnique({
    where: { id: claimId },
    include: { job: true },
  });
  if (!claim || claim.contractorId !== session.user.id) return;
  if (claim.status !== "ACTIVE") return;

  await prisma.jobClaim.update({
    where: { id: claimId },
    data: { contractorConfirmedAt: new Date() },
  });

  await maybeComplete(claimId);
  revalidatePath(`/claims/${claimId}`);
}

export async function confirmByConsumer(claimId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const claim = await prisma.jobClaim.findUnique({
    where: { id: claimId },
    include: { job: true },
  });
  if (!claim) return;
  if (claim.job.consumerId !== session.user.id) return;
  if (claim.status !== "ACTIVE") return;

  await prisma.jobClaim.update({
    where: { id: claimId },
    data: { consumerConfirmedAt: new Date() },
  });

  await maybeComplete(claimId);
  revalidatePath(`/claims/${claimId}`);
  revalidatePath(`/jobs/${claim.jobId}`);
}

async function maybeComplete(claimId: string) {
  const claim = await prisma.jobClaim.findUnique({
    where: { id: claimId },
    include: { job: { include: { consumer: true } }, contractor: true },
  });
  if (!claim) return;
  if (claim.contractorConfirmedAt && claim.consumerConfirmedAt) {
    await prisma.$transaction([
      prisma.jobClaim.update({
        where: { id: claimId },
        data: { status: "COMPLETED", completedAt: new Date() },
      }),
      prisma.job.update({
        where: { id: claim.jobId },
        data: { status: "COMPLETED" },
      }),
    ]);
    await sendNotification({
      to: claim.job.consumer.email,
      subject: "Je klus is afgerond — laat een review achter",
      body: `Bedankt voor het bevestigen. Beoordeel ${claim.contractor.companyName ?? claim.contractor.name} via je dashboard.`,
    });
  }
}

export async function cancelJob(jobId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.consumerId !== session.user.id) return;
  if (job.status === "COMPLETED") return;

  await prisma.job.update({
    where: { id: jobId },
    data: { status: "CANCELLED" },
  });
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

export async function activateClaim(claimId: string): Promise<void> {
  const claim = await prisma.jobClaim.findUnique({
    where: { id: claimId },
    include: { job: { include: { consumer: true } }, contractor: true },
  });
  if (!claim) return;
  if (claim.status !== "PENDING_PAYMENT") return;

  const expiresAt = computeExpiry();

  await prisma.$transaction([
    prisma.jobClaim.update({
      where: { id: claimId },
      data: {
        status: "ACTIVE",
        paidAt: new Date(),
        expiresAt,
      },
    }),
    prisma.job.update({
      where: { id: claim.jobId },
      data: { status: "CLAIMED" },
    }),
  ]);

  await sendNotification({
    to: claim.job.consumer.email,
    subject: "Je klus is geclaimd op Klusblok",
    body: `Een aannemer (${claim.contractor.companyName ?? claim.contractor.name}) heeft jouw klus geclaimd en neemt binnen 2 uur contact met je op via ${claim.contractor.phone ?? "telefoon/e-mail"}.`,
  });

  await sendNotification({
    to: claim.contractor.email,
    subject: "Contactgegevens voor je geclaimde klus",
    body: `Neem binnen 2 uur contact op met ${claim.job.consumer.name} via ${claim.job.consumer.phone}. Bekijk de klus in je dashboard.`,
  });
}
