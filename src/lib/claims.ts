import { prisma } from "@/lib/db";
import { CLAIM_WINDOW_MINUTES } from "@/lib/services";

export async function expireStaleClaims(jobId?: string): Promise<void> {
  const now = new Date();
  await prisma.jobClaim.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: now },
      ...(jobId ? { jobId } : {}),
    },
    data: { status: "EXPIRED" },
  });

  const affectedJobs = await prisma.job.findMany({
    where: {
      status: "CLAIMED",
      ...(jobId ? { id: jobId } : {}),
      claims: {
        none: { status: { in: ["ACTIVE", "PENDING_PAYMENT", "COMPLETED"] } },
      },
    },
    select: { id: true },
  });

  if (affectedJobs.length > 0) {
    await prisma.job.updateMany({
      where: { id: { in: affectedJobs.map((j) => j.id) } },
      data: { status: "OPEN" },
    });
  }
}

export function computeExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + CLAIM_WINDOW_MINUTES * 60 * 1000);
}

export function minutesLeft(expiresAt: Date): number {
  return Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 60000));
}
