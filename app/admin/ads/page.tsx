"use client";

import { Plus, Edit2, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminAds() {
  const ads: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Marcas & Anúncios</h2>
          <p className="text-muted-foreground font-light">Gerencie os banners e espaços publicitários de parceiros.</p>
        </div>
        <Button className="metallic-gradient text-black font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Novo Anúncio
        </Button>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Marca Parceira</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Tipo/Espaço</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Cliques</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Status</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum anúncio cadastrado ainda.</p>
                  </td>
                </tr>
              ) : (
                ads.map((ad) => (
                  <tr key={ad.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium text-white">{ad.brand}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground text-sm">{ad.type}</td>
                    <td className="py-4 text-white font-mono">{ad.clicks}</td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${ad.status === 'Ativo' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors" title="Ver Link">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-white transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
