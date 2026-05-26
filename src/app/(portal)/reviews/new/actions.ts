"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  claimId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(10, "Schrijf minimaal 10 tekens"),
});

export type ReviewState = { error?: string } | undefined;

export async function createReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = schema.safeParse({
    claimId: formData.get("claimId"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" };
  }

  const claim = await prisma.jobClaim.findUnique({
    where: { id: parsed.data.claimId },
    include: { job: true },
  });
  if (!claim || claim.job.consumerId !== session.user.id) {
    return { error: "Niet toegestaan" };
  }
  if (claim.status !== "COMPLETED") {
    return { error: "Klus moet eerst afgerond zijn" };
  }

  const existing = await prisma.review.findUnique({
    where: { jobId: claim.jobId },
  });
  if (existing) return { error: "Je hebt al een review geschreven" };

  await prisma.review.create({
    data: {
      jobId: claim.jobId,
      authorId: session.user.id,
      subjectId: claim.contractorId,
      rating: parsed.data.rating,
      body: parsed.data.body,
    },
  });

  redirect("/dashboard");
}
