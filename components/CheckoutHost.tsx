"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { PurchaseCourseModal } from "@/components/PurchaseCourseModal";
import { LoginModal } from "@/components/LoginModal";

const EVENT = "ink:open-checkout";

/** Opens the shared checkout (price, coupon, payment method) for any catalog product. */
export function openCheckout(productId: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { productId } }));
}

export function CheckoutHost() {
  const { isSignedIn } = useAuth();
  const [productId, setProductId] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ productId: string }>).detail?.productId;
      if (!id) return;
      if (!isSignedIn) setNeedsLogin(true);
      else setProductId(id);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [isSignedIn]);

  return (
    <>
      <PurchaseCourseModal isOpen={!!productId} onClose={() => setProductId(null)} productId={productId ?? undefined} />
      <LoginModal isOpen={needsLogin} onClose={() => setNeedsLogin(false)} initialView="register" />
    </>
  );
}
