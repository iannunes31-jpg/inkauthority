import { PLANS } from "@/lib/pricing";

/**
 * Server-side product catalog for checkout. /api/checkout must NEVER trust a
 * price or product type sent by the client: both resolve from here (or, for
 * course purchases, from the `courses` row in Supabase).
 */
export type CatalogProduct = {
  name: string;
  price: number; // BRL
  isSubscription: boolean;
  type: string; // stored as user_purchases.product_type; decides what is unlocked
};

export const PRODUCT_CATALOG: Record<string, CatalogProduct> = {
  ...Object.fromEntries(
    Object.values(PLANS).map((p) => [p.id, { name: p.name, price: p.price, isSubscription: true, type: p.accessType }])
  ),
  marketing_posicionamento: {
    name: "Curso Marketing & Posicionamento",
    price: 759,
    isSubscription: false,
    type: "catalog",
  },
};

// Fallback price for course purchases (productType 'course') until the
// `courses` table has a real `price` column.
export const DEFAULT_COURSE_PRICE = 97.0;
