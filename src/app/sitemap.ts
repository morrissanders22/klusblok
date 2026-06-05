import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://klusblok.nl";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/hoe-werkt-het`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/register/consumer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/register/contractor`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/voorwaarden`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let jobs: { id: string; createdAt: Date }[] = [];
  try {
    jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      select: { id: true, createdAt: true },
      take: 1000,
    });
  } catch {
    // db unreachable at build time → ship static pages only
  }

  const jobPages: MetadataRoute.Sitemap = jobs.map((j) => ({
    url: `${SITE_URL}/jobs/${j.id}`,
    lastModified: j.createdAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  return [...staticPages, ...jobPages];
}
