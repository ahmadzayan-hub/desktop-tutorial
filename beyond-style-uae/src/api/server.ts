import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { orderInputSchema, productInputSchema } from "@/schemas/product";
import { createOrder } from "@/api/payment";

const app = new Hono();

app.use("/api/*", cors());

app.get("/api/health", (c) => c.json({ ok: true }));

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

// Admin: create product — Zod compliance rejects misleading gold terms.
app.post("/api/products", zValidator("json", productInputSchema), async (c) => {
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

// Checkout — COD forced to pending_verification + WhatsApp ping in createOrder.
app.post("/api/orders", zValidator("json", orderInputSchema), async (c) => {
  const order = await createOrder(c.req.valid("json"));
  return c.json(order, 201);
});

// Abandoned-cart recovery beacon (from useAbandonedCart).
app.post("/api/abandoned-cart", async (c) => {
  const payload = await c.req.json().catch(() => ({}));
  console.info("[abandoned-cart]", payload);
  return c.json({ queued: true });
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port });
console.info(`Beyond Style UAE API listening on :${port}`);

export { app };
