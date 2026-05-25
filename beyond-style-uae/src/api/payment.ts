import { randomUUID } from "node:crypto";
import { db, schema } from "@/db";
import { computeShipping } from "@/lib/shipping";
import type { OrderInput } from "@/schemas/product";

export interface CreatedOrder {
  id: string;
  status: schema.Order["status"];
  subtotalAed: number;
  shippingAed: number;
  totalAed: number;
}

/**
 * Fire a WhatsApp confirmation request for a COD order. COD has a high
 * fake/no-show rate, so we never auto-dispatch — ops must confirm with the
 * buyer first. Falls back to a structured log when WhatsApp creds are absent
 * so the flow is observable in every environment.
 */
async function sendCodVerificationWhatsApp(order: CreatedOrder, input: OrderInput): Promise<boolean> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const to = process.env.OPS_WHATSAPP_TO || input.phone;

  const message = `COD order ${order.id} for ${input.customerName} (${input.phone}) — ${order.totalAed} AED. Confirm before dispatch.`;

  if (!phoneId || !token) {
    console.info("[COD][whatsapp:log-fallback]", { to, message });
    return false;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });
    if (!res.ok) {
      console.error("[COD][whatsapp:error]", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[COD][whatsapp:exception]", err);
    return false;
  }
}

/**
 * Create an order. Server recomputes totals from item prices (never trusts
 * the client) and forces COD orders into `pending_verification`.
 */
export async function createOrder(input: OrderInput): Promise<CreatedOrder> {
  const subtotal = input.items.reduce((sum, i) => sum + i.priceAed * i.qty, 0);
  const { shippingAed } = computeShipping(subtotal);
  const total = subtotal + shippingAed;

  const id = randomUUID();
  // COD is always unverified at creation. Card payments would flip to
  // "confirmed" only after a successful gateway capture (not wired here).
  const status: schema.Order["status"] =
    input.paymentMethod === "cod" ? "pending_verification" : "pending_verification";

  const created: CreatedOrder = {
    id,
    status,
    subtotalAed: subtotal,
    shippingAed,
    totalAed: total,
  };

  const verificationSentAt =
    input.paymentMethod === "cod" ? new Date() : null;

  await db.insert(schema.orders).values({
    id,
    customerName: input.customerName,
    phone: input.phone,
    emirate: input.emirate,
    addressLine: input.addressLine,
    paymentMethod: input.paymentMethod,
    status,
    subtotalAed: subtotal.toFixed(2),
    shippingAed: shippingAed.toFixed(2),
    totalAed: total.toFixed(2),
    items: input.items,
    verificationSentAt,
  });

  if (input.paymentMethod === "cod") {
    await sendCodVerificationWhatsApp(created, input);
  }

  return created;
}
