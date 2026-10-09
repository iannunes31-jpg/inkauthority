// Single source of truth for subscription prices: the tools page displays
// these, /api/checkout charges them, and `accessType` is what a purchase unlocks.

export type PlanId = "dante_whatsapp" | "artisticos_premium" | "anuncios_premium" | "combo_ia";

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // BRL per month
  accessType: string;
};

export const PLANS: Record<PlanId, Plan> = {
  dante_whatsapp: { id: "dante_whatsapp", name: "Dante — Assistente de WhatsApp", price: 259, accessType: "dante" },
  artisticos_premium: { id: "artisticos_premium", name: "Especialistas Artísticos", price: 99, accessType: "artisticos" },
  anuncios_premium: { id: "anuncios_premium", name: "Especialistas em Anúncios", price: 129, accessType: "ads" },
  combo_ia: { id: "combo_ia", name: "Combo IA Completo", price: 347, accessType: "subscription" },
};

export const COMBO_ITEMS: PlanId[] = ["dante_whatsapp", "artisticos_premium", "anuncios_premium"];
export const COMBO_FULL_PRICE = COMBO_ITEMS.reduce((sum, id) => sum + PLANS[id].price, 0);
export const COMBO_SAVINGS = COMBO_FULL_PRICE - PLANS.combo_ia.price;

// "subscription" is the combo; "tools" is the old R$97 plan, kept so existing
// subscribers don't lose Dante.
export const ACCESS_TYPES: Record<"dante" | "artisticos" | "ads", string[]> = {
  dante: ["subscription", "tools", "dante"],
  artisticos: ["subscription", "artisticos"],
  ads: ["subscription", "ads"],
};

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
}
