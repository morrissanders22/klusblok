import { prisma } from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY);
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export type AdminStats = {
  signups: { total: number; week: number; month: number };
  users: { consumers: number; contractors: number; admins: number; verified: number; unverified: number };
  active: { contractorsLast30d: number; consumersLast30d: number };
  jobs: { total: number; open: number; claimed: number; completed: number; cancelled: number; singles: number; projects: number };
  claims: { total: number; active: number; completed: number; expired: number; pending: number };
  payments: { totalRevenueCents: number; thisMonthCents: number; weekCents: number; count: number };
  reviews: { count: number; avgRating: number };
  funnels: {
    jobsClaimed: number;
    jobsCompleted: number;
    claimConversion: number;
    completionRate: number;
  };
  timing: {
    avgTimeToClaimMs: number | null;
    avgTimeToCompletionMs: number | null;
  };
};

export async function getAdminStats(): Promise<AdminStats> {
  const monthStart = startOfMonth();
  const weekAgo = daysAgo(7);
  const thirtyAgo = daysAgo(30);

  const [
    totalUsers,
    consumers,
    contractors,
    admins,
    verified,
    unverified,
    signupsWeek,
    signupsMonth,
    contractorsActive,
    consumersActive,
    totalJobs,
    openJobs,
    claimedJobs,
    completedJobs,
    cancelledJobs,
    singles,
    projects,
    totalClaims,
    activeClaims,
    completedClaims,
    expiredClaims,
    pendingClaims,
    paymentsAll,
    paymentsMonth,
    paymentsWeek,
    paymentsCount,
    reviewsAgg,
    reviewsCount,
    timingClaims,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CONSUMER" } }),
    prisma.user.count({ where: { role: "CONTRACTOR" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { emailVerified: null } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count({
      where: {
        role: "CONTRACTOR",
        claims: { some: { createdAt: { gte: thirtyAgo } } },
      },
    }),
    prisma.user.count({
      where: {
        role: "CONSUMER",
        jobs: { some: { createdAt: { gte: thirtyAgo } } },
      },
    }),
    prisma.job.count(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.job.count({ where: { status: "CLAIMED" } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.job.count({ where: { status: "CANCELLED" } }),
    prisma.job.count({ where: { type: "SINGLE" } }),
    prisma.job.count({ where: { type: "PROJECT" } }),
    prisma.jobClaim.count(),
    prisma.jobClaim.count({ where: { status: "ACTIVE" } }),
    prisma.jobClaim.count({ where: { status: "COMPLETED" } }),
    prisma.jobClaim.count({ where: { status: "EXPIRED" } }),
    prisma.jobClaim.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amountCents: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amountCents: true },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: weekAgo } },
      _sum: { amountCents: true },
    }),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.review.count(),
    prisma.jobClaim.findMany({
      where: { status: "COMPLETED" },
      select: {
        createdAt: true,
        completedAt: true,
        paidAt: true,
        job: { select: { createdAt: true } },
      },
      take: 200,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  let timeToClaimSum = 0;
  let timeToClaimCount = 0;
  let timeToCompletionSum = 0;
  let timeToCompletionCount = 0;

  for (const c of timingClaims) {
    if (c.paidAt && c.job.createdAt) {
      timeToClaimSum += c.paidAt.getTime() - c.job.createdAt.getTime();
      timeToClaimCount += 1;
    }
    if (c.completedAt && c.paidAt) {
      timeToCompletionSum += c.completedAt.getTime() - c.paidAt.getTime();
      timeToCompletionCount += 1;
    }
  }

  return {
    signups: {
      total: totalUsers,
      week: signupsWeek,
      month: signupsMonth,
    },
    users: {
      consumers,
      contractors,
      admins,
      verified,
      unverified,
    },
    active: {
      contractorsLast30d: contractorsActive,
      consumersLast30d: consumersActive,
    },
    jobs: {
      total: totalJobs,
      open: openJobs,
      claimed: claimedJobs,
      completed: completedJobs,
      cancelled: cancelledJobs,
      singles,
      projects,
    },
    claims: {
      total: totalClaims,
      active: activeClaims,
      completed: completedClaims,
      expired: expiredClaims,
      pending: pendingClaims,
    },
    payments: {
      totalRevenueCents: paymentsAll._sum.amountCents ?? 0,
      thisMonthCents: paymentsMonth._sum.amountCents ?? 0,
      weekCents: paymentsWeek._sum.amountCents ?? 0,
      count: paymentsCount,
    },
    reviews: {
      count: reviewsCount,
      avgRating: reviewsAgg._avg.rating ?? 0,
    },
    funnels: {
      jobsClaimed: totalJobs - openJobs - cancelledJobs,
      jobsCompleted: completedJobs,
      claimConversion:
        totalJobs > 0
          ? ((totalJobs - openJobs - cancelledJobs) / totalJobs) * 100
          : 0,
      completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
    },
    timing: {
      avgTimeToClaimMs:
        timeToClaimCount > 0 ? timeToClaimSum / timeToClaimCount : null,
      avgTimeToCompletionMs:
        timeToCompletionCount > 0
          ? timeToCompletionSum / timeToCompletionCount
          : null,
    },
  };
}

export function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 60_000) return `${Math.round(ms / 1000)} sec`;
  if (ms < 60 * 60_000) return `${Math.round(ms / 60_000)} min`;
  if (ms < 24 * 60 * 60_000) return `${(ms / (60 * 60_000)).toFixed(1)} uur`;
  return `${(ms / (24 * 60 * 60_000)).toFixed(1)} dagen`;
}
