"use client";

import { useEffect, useState } from "react";
import { openCheckout } from "@/components/CheckoutHost";

// Products the landing page is allowed to open the checkout for.
const LANDING_PRODUCTS = ["marketing_posicionamento"];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The landing lives in an iframe; its "buy" buttons ask this page to open the checkout.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "OPEN_CHECKOUT" && LANDING_PRODUCTS.includes(e.data.productId)) {
        openCheckout(e.data.productId);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <main className="relative min-h-screen w-full m-0 p-0 overflow-hidden bg-[#050505] pt-[72px]">
      {mounted && (
        <iframe
          src="/index-nova.html?v=412"
          className="w-full"
          style={{ height: 'calc(100vh - 72px)', border: 'none' }}
          title="Ink Authority Landing Page"
        />
      )}
    </main>
  );
}
