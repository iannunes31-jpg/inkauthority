"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdminUser } from "@/lib/admin";
import { fetchAccess, hasProductType } from "@/lib/access";
import { PLANS, PlanId, ACCESS_TYPES, COMBO_FULL_PRICE, COMBO_SAVINGS, formatBRL } from "@/lib/pricing";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function startCheckout(planId: PlanId) {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: planId, returnUrl: window.location.pathname }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error || "Erro ao iniciar o pagamento.");
  } catch {
    alert("Erro ao iniciar o pagamento.");
  }
}

type Props = {
  plan: Exclude<PlanId, "combo_ia">;
  description: string;
  children: React.ReactNode;
};

export function PlanAccessGate({ plan, description, children }: Props) {
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const isAdmin = isAdminUser(user?.primaryEmailAddress?.emailAddress, user?.publicMetadata);
  const p = PLANS[plan];

  useEffect(() => {
    if (!user?.id) return;
    if (isAdmin) { setHasAccess(true); return; }
    fetchAccess(user.id)
      .then((access) => setHasAccess(hasProductType(access, ACCESS_TYPES[p.accessType as keyof typeof ACCESS_TYPES])))
      .catch(() => setHasAccess(false));
  }, [user?.id]);

  if (hasAccess === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative">
      {!hasAccess && (
        <div className="absolute inset-0 z-50 flex items-start justify-center p-6 pt-24 backdrop-blur-md bg-black/60 min-h-screen">
          <div className="glass p-8 max-w-lg w-full text-center rounded-3xl border border-white/10 shadow-2xl">
            <Lock className="w-14 h-14 text-primary mx-auto mb-5" />
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-3 text-foreground">{p.name}</h2>
            <p className="text-muted-foreground mb-6 text-sm">{description}</p>

            <div className="mb-4">
              <span className="text-4xl font-black text-foreground">{formatBRL(p.price)}</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <Button onClick={() => startCheckout(plan)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12">
              Assinar por {formatBRL(p.price)}/mês
            </Button>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-muted-foreground mb-2">
                Ou leve <strong className="text-foreground">Dante + Artísticos + Anúncios</strong> no combo:
              </p>
              <p className="mb-3">
                <span className="text-sm text-muted-foreground line-through mr-2">{formatBRL(COMBO_FULL_PRICE)}</span>
                <span className="text-xl font-black text-foreground">{formatBRL(PLANS.combo_ia.price)}</span>
                <span className="text-muted-foreground text-sm">/mês</span>
              </p>
              <Button onClick={() => startCheckout("combo_ia")} variant="outline" className="w-full font-bold h-11 border-white/20">
                Assinar Combo e economizar {formatBRL(COMBO_SAVINGS)}/mês
              </Button>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
