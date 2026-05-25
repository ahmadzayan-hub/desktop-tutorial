// Client-facing shapes (kept free of server/mysql2 imports).
export interface ProductDTO {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  priceAed: string;
  compareAtAed: string | null;
  material: string;
  cloudinaryIds: string[];
  stock: number;
  ratingAvg: string;
  ratingCount: number;
}

export interface ReviewDTO {
  id: string;
  productId: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
}
