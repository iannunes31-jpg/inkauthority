/**
 * Server-side product catalog for Stripe checkout.
 *
 * IMPORTANT: /api/checkout must NEVER trust a price sent by the client.
 * Before this file existed, the checkout route built the Stripe session
 * using whatever `price` the browser sent in the POST body — anyone could
 * open devtools, edit the request, and buy anything for R$0,01. Every price
 * charged to a customer must resolve from here (or, for course purchases,
 * from the `courses` row in Supabase), never from the request body.
 */
export type CatalogProduct = {
  name: string;
  price: number; // BRL
  isSubscription: boolean;
};

export const PRODUCT_CATALOG: Record<string, CatalogProduct> = {
  tools_premium: {
    name: "Especialistas IA Premium",
    price: 97.0,
    isSubscription: true,
  },
  marketing_posicionamento: {
    name: "Curso Marketing & Posicionamento",
    price: 997,
    isSubscription: false,
  },
};

// Fallback price for course purchases (productType 'course') until the
// `courses` table has a real `price` column. Keeps today's de-facto
// behavior (every course was already effectively R$97 via a client-side
// fallback) but resolved server-side instead of trusted from the client.
export const DEFAULT_COURSE_PRICE = 97.0;
