import type { ProductDTO, ReviewDTO } from "@/types";
import type { OrderInput } from "@/schemas/product";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  listProducts: () => fetch("/api/products").then(json<ProductDTO[]>),
  getProduct: (slug: string) =>
    fetch(`/api/products/${slug}`).then(json<{ product: ProductDTO; reviews: ReviewDTO[] }>),
  createOrder: (input: OrderInput) =>
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then(json<{ id: string; status: string; totalAed: number }>),
};
