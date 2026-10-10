import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { resolveCoupon } from "@/lib/coupons";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Faça login para usar um cupom." }, { status: 401 });

  const { code, productId, productType } = await req.json();
  const result = await resolveCoupon(code, String(productId || ""), userId, productType);
  if (!result.ok) return NextResponse.json({ valid: false, error: result.error }, { status: 200 });

  return NextResponse.json({
    valid: true,
    code: result.coupon.code,
    label: result.label,
    originalPrice: result.originalPrice,
    finalPrice: result.finalPrice,
    discount: result.discount,
  });
}
