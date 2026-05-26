import { prisma } from "@/lib/db";
import { PaymentStatus } from "@prisma/client";

const MOLLIE_API_KEY = process.env.MOLLIE_API_KEY;
const APP_URL = process.env.APP_URL ?? "http://localhost:3002";

type CreatePaymentInput = {
  claimId: string;
  amountCents: number;
  description: string;
};

type CreatePaymentResult = {
  paymentId: string;
  checkoutUrl: string;
};

export async function createMolliePayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const payment = await prisma.payment.create({
    data: {
      claimId: input.claimId,
      amountCents: input.amountCents,
    },
  });

  if (!MOLLIE_API_KEY) {
    const checkoutUrl = `${APP_URL}/payments/${payment.id}/dev-confirm`;
    return { paymentId: payment.id, checkoutUrl };
  }

  const amountEuros = (input.amountCents / 100).toFixed(2);

  const res = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MOLLIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "EUR", value: amountEuros },
      description: input.description,
      redirectUrl: `${APP_URL}/payments/${payment.id}/return`,
      webhookUrl: `${APP_URL}/api/webhooks/mollie`,
      metadata: { paymentId: payment.id, claimId: input.claimId },
    }),
  });

  if (!res.ok) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    throw new Error(`Mollie create payment failed: ${res.status}`);
  }

  const body = (await res.json()) as {
    id: string;
    _links: { checkout: { href: string } };
  };

  await prisma.payment.update({
    where: { id: payment.id },
    data: { providerRef: body.id },
  });

  return {
    paymentId: payment.id,
    checkoutUrl: body._links.checkout.href,
  };
}

export async function fetchMollieStatus(
  providerRef: string,
): Promise<PaymentStatus> {
  if (!MOLLIE_API_KEY) return "PAID";

  const res = await fetch(`https://api.mollie.com/v2/payments/${providerRef}`, {
    headers: { Authorization: `Bearer ${MOLLIE_API_KEY}` },
  });
  if (!res.ok) return "FAILED";

  const body = (await res.json()) as { status: string };
  switch (body.status) {
    case "paid":
      return "PAID";
    case "open":
    case "pending":
      return "OPEN";
    case "canceled":
      return "CANCELLED";
    case "expired":
      return "EXPIRED";
    default:
      return "FAILED";
  }
}

export function isDevPaymentMode(): boolean {
  return !MOLLIE_API_KEY;
}
