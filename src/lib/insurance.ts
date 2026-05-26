export const INSURANCE_GRACE_DAYS = 30;

export function insuranceGraceDeadline(createdAt: Date): Date {
  return new Date(createdAt.getTime() + INSURANCE_GRACE_DAYS * 24 * 60 * 60 * 1000);
}

export function insuranceGraceDaysLeft(createdAt: Date): number {
  const deadline = insuranceGraceDeadline(createdAt);
  const ms = deadline.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

export function insuranceRequired(
  createdAt: Date,
  confirmedAt: Date | null,
): "ok" | "warn" | "blocked" {
  if (confirmedAt) return "ok";
  const left = insuranceGraceDaysLeft(createdAt);
  if (left === 0) return "blocked";
  return "warn";
}
