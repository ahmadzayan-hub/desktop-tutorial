import type { ProductDTO, ReviewDTO } from "@/types";

// Demo catalogue used when the API/DB is not running. All copy is compliant
// (no "real gold" / karat terms) and material is "Gold-tone plated".
export const SAMPLE_PRODUCTS: ProductDTO[] = [
  {
    id: "p1",
    slug: "celestial-pendant",
    titleEn: "Celestial Pendant Necklace",
    titleAr: "قلادة سيليستيال",
    descriptionEn: "A delicate gold-tone plated pendant with a hand-set crystal.",
    descriptionAr: "قلادة أنيقة مطلية بطبقة ذهبية اللون مع كريستال مرصّع يدويًا.",
    priceAed: "149.00",
    compareAtAed: "199.00",
    material: "Gold-tone plated",
    cloudinaryIds: ["beyond-style/celestial-pendant"],
    stock: 24,
    ratingAvg: "4.80",
    ratingCount: 37,
  },
  {
    id: "p2",
    slug: "infinity-hoops",
    titleEn: "Infinity Hoop Earrings",
    titleAr: "أقراط إنفينيتي",
    descriptionEn: "Lightweight gold-tone plated hoops for everyday luxury.",
    descriptionAr: "أقراط خفيفة مطلية بطبقة ذهبية اللون لإطلالة فاخرة يومية.",
    priceAed: "89.00",
    compareAtAed: null,
    material: "Gold-tone plated",
    cloudinaryIds: ["beyond-style/infinity-hoops"],
    stock: 60,
    ratingAvg: "4.60",
    ratingCount: 52,
  },
  {
    id: "p3",
    slug: "amira-bangle-set",
    titleEn: "Amira Bangle Set",
    titleAr: "طقم أساور أميرة",
    descriptionEn: "A set of three stackable gold-tone plated bangles.",
    descriptionAr: "طقم من ثلاثة أساور قابلة للتركيب مطلية بطبقة ذهبية اللون.",
    priceAed: "120.00",
    compareAtAed: "160.00",
    material: "Gold-tone plated",
    cloudinaryIds: ["beyond-style/amira-bangle-set"],
    stock: 18,
    ratingAvg: "4.90",
    ratingCount: 21,
  },
];

export const SAMPLE_REVIEWS: ReviewDTO[] = [
  {
    id: "r1",
    productId: "p1",
    author: "Layla",
    rating: 5,
    body: "Looks stunning and arrived quickly. The plating still looks great after weeks.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r2",
    productId: "p1",
    author: "Sara",
    rating: 4,
    body: "Beautiful piece, exactly as pictured.",
    createdAt: new Date().toISOString(),
  },
];
