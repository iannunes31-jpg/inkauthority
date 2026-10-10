"use client";

import { useEffect, useState } from "react";
import { Ticket, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATALOG } from "@/lib/products";

type Coupon = {
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

const PRODUCTS = Object.entries(PRODUCT_CATALOG).map(([id, p]) => ({ id, name: p.name, isSubscription: p.isSubscription }));

const emptyForm = {
  code: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "",
  applies_to: [] as string[],
  duration: "once" as "once" | "forever",
  max_uses: "",
  one_per_user: true,
  expires_at: "",
};

function describe(c: Coupon) {
  const value = c.discount_type === "percent" ? `${Number(c.discount_value)}%` : `R$ ${Number(c.discount_value).toFixed(2).replace(".", ",")}`;
  return `${value} off`;
}

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/coupons", { cache: "no-store" });
    const data = await res.json().catch(() => []);
    if (!res.ok) setError(data.error || "Erro ao carregar cupons. Rodou o SQL dos cupons no Supabase?");
    else setCoupons(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error || "Erro ao criar cupom."); return; }
    setForm(emptyForm);
    load();
  };

  const toggle = async (c: Coupon) => {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    });
    load();
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Excluir o cupom ${c.code}? Essa ação não pode ser desfeita.`)) return;
    await fetch(`/api/admin/coupons?id=${c.id}`, { method: "DELETE" });
    load();
  };

  const toggleProduct = (id: string) =>
    setForm((f) => ({ ...f, applies_to: f.applies_to.includes(id) ? f.applies_to.filter((p) => p !== id) : [...f.applies_to, id] }));

  const hasSubscription = form.applies_to.length === 0 || form.applies_to.some((id) => PRODUCT_CATALOG[id]?.isSubscription);
  const input = "w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-foreground focus:outline-none focus:border-white/30";
  const label = "text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1 block";

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Cupons de desconto</h1>
          <p className="text-sm text-muted-foreground">O cliente digita o código na janela de checkout, antes de pagar.</p>
        </div>
      </div>

      <form onSubmit={create} className="glass p-6 rounded-2xl border border-white/5 mb-8 space-y-5">
        <h2 className="font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Novo cupom</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={label}>Código</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, "") })}
              placeholder="EX: BLACK20"
              className={`${input} uppercase`}
              required
            />
          </div>
          <div>
            <label className={label}>Tipo de desconto</label>
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })} className={input}>
              <option value="percent">Porcentagem (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </div>
          <div>
            <label className={label}>{form.discount_type === "percent" ? "Desconto (%)" : "Desconto (R$)"}</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={form.discount_type === "percent" ? 100 : undefined}
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              placeholder={form.discount_type === "percent" ? "20" : "100"}
              className={input}
              required
            />
          </div>
        </div>

        <div>
          <label className={label}>Vale para</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, applies_to: [] })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${form.applies_to.length === 0 ? "border-primary bg-primary/10" : "border-white/10 text-muted-foreground"}`}
            >
              Todos os produtos
            </button>
            {PRODUCTS.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => toggleProduct(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${form.applies_to.includes(p.id) ? "border-primary bg-primary/10" : "border-white/10 text-muted-foreground"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {hasSubscription && (
            <div>
              <label className={label}>Nas assinaturas, vale</label>
              <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value as "once" | "forever" })} className={input}>
                <option value="once">Só na 1ª mensalidade</option>
                <option value="forever">Em todas as mensalidades</option>
              </select>
            </div>
          )}
          <div>
            <label className={label}>Limite de usos (vazio = ilimitado)</label>
            <input type="number" min="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className={input} />
          </div>
          <div>
            <label className={label}>Válido até (opcional)</label>
            <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className={input} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.one_per_user} onChange={(e) => setForm({ ...form, one_per_user: e.target.checked })} />
          Cada pessoa só pode usar uma vez
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground font-bold">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar cupom"}
        </Button>
      </form>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : coupons.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">Nenhum cupom criado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Desconto</th>
                  <th className="px-4 py-3">Produtos</th>
                  <th className="px-4 py-3">Usos</th>
                  <th className="px-4 py-3">Validade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-t border-white/5">
                    <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                    <td className="px-4 py-3">
                      {describe(c)}
                      {c.duration === "forever" && <span className="block text-[11px] text-muted-foreground">todas as mensalidades</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.applies_to.length === 0 ? "Todos" : c.applies_to.map((id) => PRODUCT_CATALOG[id]?.name ?? id).join(", ")}
                    </td>
                    <td className="px-4 py-3">{c.uses}{c.max_uses != null ? ` / ${c.max_uses}` : ""}</td>
                    <td className="px-4 py-3 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-BR") : "Sem prazo"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(c)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${c.active ? "bg-green-500/15 text-green-500" : "bg-white/10 text-muted-foreground"}`}
                      >
                        {c.active ? "Ativo" : "Pausado"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(c)} className="p-2 text-muted-foreground hover:text-red-500" aria-label={`Excluir ${c.code}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
