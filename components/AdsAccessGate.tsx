"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { fetchAccess, hasProductType } from "@/lib/access";
import { isAdminUser } from "@/lib/admin";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdsAccessGate({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const isAdmin = isAdminUser(user?.primaryEmailAddress?.emailAddress, user?.publicMetadata);

  useEffect(() => {
    if (!user?.id) return;
    if (isAdmin) { setHasAccess(true); return; }
    fetchAccess(user.id)
      .then((access) => setHasAccess(hasProductType(access, ["subscription", "ads"])))
      .catch(() => setHasAccess(false));
  }, [user?.id]);

  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "anuncios_premium",
          productType: "ads",
          returnUrl: window.location.pathname,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Erro ao carregar checkout.");
    }
  };

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
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="glass p-8 max-w-lg text-center rounded-3xl border border-white/10 shadow-2xl">
            <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-white">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-8">
              A Central de Anúncios IA é uma ferramenta exclusiva do plano Premium. Desbloqueie agora para criar campanhas, analisar resultados e gerar conteúdo com IA.
            </p>
            <Button onClick={handleCheckout} className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-lg">
              Desbloquear Central de Anúncios
            </Button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
