import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import {
  orderInputSchema,
  productInputSchema,
  productUpdateSchema,
} from "@/schemas/product";
import { createOrder } from "@/api/payment";
import { createCheckoutSession, getStripe, stripeConfigured } from "@/api/stripe";

// Shared Hono app, reused by the local Node server (server.ts) and the
// Vercel serverless handler (api/[[...route]].ts). Routes keep the /api
// prefix so the same app matches in both environments.
export const app = new Hono();

app.use("/api/*", cors());

// Simple shared-secret gate for admin routes (x-admin-token header).
const adminAuth: MiddlewareHandler = async (c, next) => {
  const token = process.env.ADMIN_TOKEN;
  if (!token || c.req.header("x-admin-token") !== token) {
    return c.json({ error: "unauthorized" }, 401);
  }
  await next();
};

app.get("/api/health", (c) => c.json({ ok: true, stripe: stripeConfigured() }));

app.get("/api/products", async (c) => {
  const rows = await db.select().from(schema.products).where(eq(schema.products.active, true));
  return c.json(rows);
});

app.get("/api/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.slug, slug))
    .limit(1);
  if (!product) return c.json({ error: "not_found" }, 404);
  const productReviews = await db
    .select()
    .from(schema.reviews)
    .where(eq(schema.reviews.productId, product.id));
  return c.json({ product, reviews: productReviews });
});

// Checkout. COD → pending_verification + WhatsApp. Card → pending_payment
// plus a hosted Stripe Checkout Session whose URL the client redirects to.
app.post("/api/orders", zValidator("json", orderInputSchema), async (c) => {
  const input = c.req.valid("json");
  const order = await createOrder(input);

  if (input.paymentMethod === "card") {
    if (!stripeConfigured()) {
      return c.json({ error: "card_payments_unavailable" }, 503);
    }
    const ids = input.items.map((i) => i.productId);
    const products = ids.length
      ? await db.select().from(schema.products).where(inArray(schema.products.id, ids))
      : [];
    const nameById = new Map(products.map((p) => [p.id, p.titleEn]));

    const session = await createCheckoutSession({
      orderId: order.id,
      shippingAed: order.shippingAed,
      origin: c.req.header("origin") ?? process.env.PUBLIC_BASE_URL ?? "http://localhost:5173",
      items: input.items.map((i) => ({
        name: nameById.get(i.productId) ?? "Beyond Style item",
        priceAed: i.priceAed,
        qty: i.qty,
      })),
    });

    await db
      .update(schema.orders)
      .set({ stripeSessionId: session.id })
      .where(eq(schema.orders.id, order.id));

    return c.json({ ...order, checkoutUrl: session.url }, 201);
  }

  return c.json(order, 201);
});

// Stripe webhook — confirms the order once payment completes. Needs the raw
// request body for signature verification.
app.post("/api/stripe/webhook", async (c) => {
  const sig = c.req.header("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return c.json({ error: "webhook_not_configured" }, 400);

  const payload = await c.req.text();
  let event;
  try {
    event = await getStripe().webhooks.constructEventAsync(payload, sig, secret);
  } catch {
    return c.json({ error: "invalid_signature" }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await db
      .update(schema.orders)
      .set({ status: "confirmed" })
      .where(eq(schema.orders.stripeSessionId, session.id));
  }

  return c.json({ received: true });
});

// Abandoned-cart recovery beacon (from useAbandonedCart).
app.post("/api/abandoned-cart", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  console.info("[abandoned-cart]", payload);
  return c.json({ queued: true });
});

// ---- Admin (x-admin-token) ----

// Full catalogue including inactive products.
app.get("/api/admin/products", adminAuth, async (c) => {
  const rows = await db.select().from(schema.products);
  return c.json(rows);
});

// Create — Zod compliance rejects misleading gold terms.
app.post("/api/admin/products", adminAuth, zValidator("json", productInputSchema), async (c) => {
  const input = c.req.valid("json");
  const id = crypto.randomUUID();
  await db.insert(schema.products).values({
    id,
    slug: input.slug,
    titleEn: input.titleEn,
    titleAr: input.titleAr,
    descriptionEn: input.descriptionEn,
    descriptionAr: input.descriptionAr,
    priceAed: input.priceAed.toFixed(2),
    compareAtAed: input.compareAtAed?.toFixed(2),
    material: input.material,
    cloudinaryIds: input.cloudinaryIds,
    stock: input.stock,
  });
  return c.json({ id }, 201);
});

// Update — partial, compliance-checked.
app.patch(
  "/api/admin/products/:id",
  adminAuth,
  zValidator("json", productUpdateSchema),
  async (c) => {
    const id = c.req.param("id");
    const u = c.req.valid("json");
    await db
      .update(schema.products)
      .set({
        ...(u.titleEn !== undefined && { titleEn: u.titleEn }),
        ...(u.titleAr !== undefined && { titleAr: u.titleAr }),
        ...(u.descriptionEn !== undefined && { descriptionEn: u.descriptionEn }),
        ...(u.descriptionAr !== undefined && { descriptionAr: u.descriptionAr }),
        ...(u.priceAed !== undefined && { priceAed: u.priceAed.toFixed(2) }),
        ...(u.compareAtAed !== undefined && {
          compareAtAed: u.compareAtAed === null ? null : u.compareAtAed.toFixed(2),
        }),
        ...(u.material !== undefined && { material: u.material }),
        ...(u.stock !== undefined && { stock: u.stock }),
        ...(u.active !== undefined && { active: u.active }),
      })
      .where(eq(schema.products.id, id));
    return c.json({ id });
  },
);

// Soft-delete — deactivate so existing orders keep referencing the product.
app.delete("/api/admin/products/:id", adminAuth, async (c) => {
  const id = c.req.param("id");
  await db.update(schema.products).set({ active: false }).where(eq(schema.products.id, id));
  return c.json({ id, active: false });
});
