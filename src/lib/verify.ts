import crypto from "node:crypto";

export function generateVerifyToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function verifyUrl(token: string): string {
  const base = process.env.APP_URL ?? "http://localhost:3002";
  return `${base}/verify/${token}`;
}
