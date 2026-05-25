import { z } from "zod";

/**
 * UAE advertising compliance: fashion jewelry is gold-tone *plated*, not
 * solid/hallmarked gold. Marketing copy must never imply precious-metal
 * content. We reject any term that suggests real karat gold and require the
 * approved "Gold-tone plated" phrasing on the material field.
 */
const FORBIDDEN_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Real Gold", re: /\breal\s+gold\b/i },
  { label: "Solid Gold", re: /\bsolid\s+gold\b/i },
  { label: "karat (e.g. 18k/24k)", re: /\b\d{1,2}\s?k(arat)?\b/i },
  { label: "Pure Gold", re: /\bpure\s+gold\b/i },
  { label: "Genuine Gold", re: /\bgenuine\s+gold\b/i },
  { label: "Sterling Silver", re: /\bsterling\s+silver\b/i },
  { label: "Hallmarked", re: /\bhallmark(ed)?\b/i },
];

function findForbidden(text: string): string | null {
  for (const { label, re } of FORBIDDEN_PATTERNS) {
    if (re.test(text)) return label;
  }
  return null;
}

const compliantText = (field: string) =>
  z.string().min(1).superRefine((val, ctx) => {
    const hit = findForbidden(val);
    if (hit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field} contains the misleading term "${hit}". Use "Gold-tone plated" terminology instead.`,
      });
    }
  });

export const REQUIRED_MATERIAL = "Gold-tone plated";

export const productInputSchema = z
  .object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
    titleEn: compliantText("titleEn"),
    titleAr: compliantText("titleAr"),
    descriptionEn: compliantText("descriptionEn"),
    descriptionAr: compliantText("descriptionAr"),
    priceAed: z.number().positive(),
    compareAtAed: z.number().positive().optional(),
    material: z.string().default(REQUIRED_MATERIAL),
    cloudinaryIds: z.array(z.string().min(1)).min(1),
    stock: z.number().int().min(0).default(0),
  })
  .refine((p) => p.material.toLowerCase().includes("plated"), {
    path: ["material"],
    message: `material must use approved plated terminology, e.g. "${REQUIRED_MATERIAL}".`,
  })
  .refine((p) => !p.compareAtAed || p.compareAtAed > p.priceAed, {
    path: ["compareAtAed"],
    message: "compareAtAed must be greater than priceAed.",
  });

export type ProductInput = z.infer<typeof productInputSchema>;

// Partial schema for admin edits. Text fields stay compliance-checked; if a
// new material is provided it must still use plated terminology.
export const productUpdateSchema = z
  .object({
    titleEn: compliantText("titleEn"),
    titleAr: compliantText("titleAr"),
    descriptionEn: compliantText("descriptionEn"),
    descriptionAr: compliantText("descriptionAr"),
    priceAed: z.number().positive(),
    compareAtAed: z.number().positive().nullable(),
    material: z.string().refine((m) => m.toLowerCase().includes("plated"), {
      message: `material must use approved plated terminology, e.g. "${REQUIRED_MATERIAL}".`,
    }),
    stock: z.number().int().min(0),
    active: z.boolean(),
  })
  .partial();

export type ProductUpdate = z.infer<typeof productUpdateSchema>;

export const orderInputSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().regex(/^\+9715\d{8}$/, "phone must be a UAE mobile in E.164 (+9715XXXXXXXX)"),
  emirate: z.enum([
    "Abu Dhabi",
    "Dubai",
    "Sharjah",
    "Ajman",
    "Umm Al Quwain",
    "Ras Al Khaimah",
    "Fujairah",
  ]),
  addressLine: z.string().min(5),
  paymentMethod: z.enum(["cod", "card"]),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.number().int().positive(),
        priceAed: z.number().positive(),
      }),
    )
    .min(1),
});

export type OrderInput = z.infer<typeof orderInputSchema>;
