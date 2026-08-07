"use client";

import { Share2, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAffiliates() {
  const affiliates = [
    { id: 1, name: "João Pedro", code: "JOAO20", clicks: 1240, conversions: 45, commission: "R$ 4.500,00" },
    { id: 2, name: "Studio Ink", code: "STUDIOINK", clicks: 890, conversions: 12, commission: "R$ 1.200,00" },
    { id: 3, name: "Amanda Tattoos", code: "AMANDA_T", clicks: 350, conversions: 5, commission: "R$ 500,00" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Painel de Afiliados</h2>
          <p className="text-muted-foreground font-light">Acompanhe o desempenho dos promotores e gerencie comissões.</p>
        </div>
        <Button className="metallic-gradient text-black font-bold">
          Gerar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4 mb-2">
            <Share2 className="w-5 h-5 text-white" />
            <h3 className="text-sm text-muted-foreground">Cliques Totais</h3>
          </div>
          <p className="text-3xl font-bold metallic-text">2,480</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4 mb-2">
            <TrendingUp className="w-5 h-5 text-white" />
            <h3 className="text-sm text-muted-foreground">Conversões</h3>
          </div>
          <p className="text-3xl font-bold metallic-text">62</p>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-sm text-muted-foreground">Comissões Pagas</h3>
          </div>
          <p className="text-3xl font-bold text-green-400">R$ 6.200,00</p>
        </div>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold mb-6">Top Afiliados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Afiliado</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Código de Indicação</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-center">Cliques</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-center">Conversões</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Comissão Total</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((aff) => (
                <tr key={aff.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-medium text-white">{aff.name}</td>
                  <td className="py-4 text-muted-foreground font-mono">{aff.code}</td>
                  <td className="py-4 text-white text-center">{aff.clicks}</td>
                  <td className="py-4 text-white text-center">{aff.conversions}</td>
                  <td className="py-4 text-right font-bold text-green-400">{aff.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
