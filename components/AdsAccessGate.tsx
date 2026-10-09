"use client";

import { PlanAccessGate } from "@/components/PlanAccessGate";

export function AdsAccessGate({ children }: { children: React.ReactNode }) {
  return (
    <PlanAccessGate
      plan="anuncios_premium"
      description="7 agentes de IA para criar campanhas, analisar público e resultados, gerar conteúdo e criar artes prontas para divulgar."
    >
      {children}
    </PlanAccessGate>
  );
}
