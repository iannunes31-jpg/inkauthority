import { supabaseAdmin } from "@/lib/supabase-admin";
import { PRODUCT_CATALOG, DEFAULT_COURSE_PRICE } from "@/lib/products";

export type Coupon = {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  applies_to: string[];
  duration: "once" | "forever";
  max_uses: number | null;
  uses: number;
  one_per_user: boolean;
  expires_at: string | null;
  active: boolean;
};

export type CouponResult =
  | { ok: true; coupon: Coupon; originalPrice: number; finalPrice: number; discount: number; label: string }
  | { ok: false; error: string };

export function normalizeCode(code: unknown) {
  return String(code ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function productPrice(productId: string, productType?: string) {
  if (productType === "course") return DEFAULT_COURSE_PRICE;
  return PRODUCT_CATALOG[productId]?.price ?? null;
}

export function couponLabel(c: Pick<Coupon, "discount_type" | "discount_value" | "duration">, isSubscription: boolean) {
  const amount =
    c.discount_type === "percent"
      ? `${Number(c.discount_value)}% off`
      : `R$ ${Number(c.discount_value).toFixed(2).replace(".", ",")} off`;
  if (!isSubscription) return amount;
  return `${amount} ${c.duration === "forever" ? "em todas as mensalidades" : "na 1ª mensalidade"}`;
}

export async function resolveCoupon(
  rawCode: unknown,
  productId: string,
  userId: string,
  productType?: string
): Promise<CouponResult> {
  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, error: "Digite um cupom." };

  const originalPrice = productPrice(productId, productType);
  if (originalPrice == null) return { ok: false, error: "Produto inválido." };

  const { data: coupon, error } = await supabaseAdmin.from("coupons").select("*").eq("code", code).maybeSingle();
  if (error) {
    console.error("[coupons] lookup error:", error);
    return { ok: false, error: "Não foi possível validar o cupom agora." };
  }
  if (!coupon || !coupon.active) return { ok: false, error: "Cupom inválido." };
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { ok: false, error: "Este cupom expirou." };
  if (coupon.max_uses != null && coupon.uses >= coupon.max_uses) {
    return { ok: false, error: "Este cupom já atingiu o limite de usos." };
  }
  if (coupon.applies_to?.length && !coupon.applies_to.includes(productId)) {
    return { ok: false, error: "Este cupom não vale para este produto." };
  }
  if (coupon.one_per_user) {
    const { data: used } = await supabaseAdmin
      .from("coupon_redemptions")
      .select("id")
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId)
      .limit(1);
    if (used && used.length > 0) return { ok: false, error: "Você já usou este cupom." };
  }

  const value = Number(coupon.discount_value);
  const discounted = coupon.discount_type === "percent" ? originalPrice * (1 - value / 100) : originalPrice - value;
  const finalPrice = Math.max(0, Math.round(discounted * 100) / 100);
  const isSubscription = PRODUCT_CATALOG[productId]?.isSubscription ?? false;

  return {
    ok: true,
    coupon: coupon as Coupon,
    originalPrice,
    finalPrice,
    discount: Math.round((originalPrice - finalPrice) * 100) / 100,
    label: couponLabel(coupon, isSubscription),
  };
}

export async function redeemCoupon(couponId: string, userId: string, productId: string) {
  const { error } = await supabaseAdmin.rpc("redeem_coupon", {
    p_coupon_id: couponId,
    p_user_id: userId,
    p_product_id: productId,
  });
  if (error) console.error("[coupons] redeem error:", error);
}
