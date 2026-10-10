"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, CheckCircle2, CreditCard, QrCode, FileText, Ticket, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PLANS, PlanId, formatBRL } from "@/lib/pricing";
import { PRODUCT_CATALOG } from "@/lib/products";

interface PurchaseCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Any catalog product: the flagship workshop (default) or a monthly plan. */
  productId?: string;
  productType?: string;
}

const FLAGSHIP_PRODUCT_ID = "marketing_posicionamento";

type PaymentMethod = "CREDIT_CARD" | "PIX" | "BOLETO";

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  gateway: "stripe" | "asaas";
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "CREDIT_CARD", label: "Cartão de Crédito", description: "Até 12x sem juros", icon: <CreditCard className="w-5 h-5" />, gateway: "stripe" },
  { id: "PIX", label: "Pix", description: "Aprovação instantânea", icon: <QrCode className="w-5 h-5" />, gateway: "asaas" },
  { id: "BOLETO", label: "Boleto Bancário", description: "Prazo de 3 dias úteis", icon: <FileText className="w-5 h-5" />, gateway: "asaas" },
];

const PLAN_BULLETS: Record<PlanId, string[]> = {
  dante_whatsapp: ["Atendimento automático no WhatsApp 24h", "Orçamentos e agendamentos pela IA", "Modo Copilot ou Piloto Automático"],
  artisticos_premium: ["Gerador de Decalque com IA", "Dividir Folhas para Impressão", "Linhas, sombras ou traço fino"],
  anuncios_premium: ["7 agentes de IA para anúncios", "Google, Meta e TikTok Ads", "Criador de Criativos prontos para postar"],
  combo_ia: ["Dante · Assistente de WhatsApp", "Especialistas Artísticos", "Especialistas em Anúncios (7 agentes)"],
};

const COURSE_BULLETS = [
  "Posicionamento e estruturação das suas redes sociais",
  "Técnicas de vendas e conversão de clientes",
  "Acesso à comunidade exclusiva da Ink Authority",
];

type AppliedCoupon = { code: string; label: string; finalPrice: number; originalPrice: number };

export function PurchaseCourseModal({
  isOpen,
  onClose,
  productId = FLAGSHIP_PRODUCT_ID,
  productType = "catalog",
}: PurchaseCourseModalProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const plan = (PLANS as Record<string, (typeof PLANS)[PlanId]>)[productId];
  const isSubscription = !!plan;
  const basePrice = plan?.price ?? PRODUCT_CATALOG[productId]?.price ?? 0;
  const price = coupon?.finalPrice ?? basePrice;
  const options = isSubscription ? PAYMENT_OPTIONS.filter((o) => o.gateway === "stripe") : PAYMENT_OPTIONS;

  useEffect(() => {
    if (!isOpen) return;
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
    setSelectedMethod("CREDIT_CARD");
    setIsLoading(false);
  }, [isOpen, productId]);

  const applyCoupon = async () => {
    if (!couponInput.trim() || isValidating) return;
    setIsValidating(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, productId, productType }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: data.code, label: data.label, finalPrice: data.finalPrice, originalPrice: data.originalPrice });
      } else {
        setCoupon(null);
        setCouponError(data.error || "Cupom inválido.");
      }
    } catch {
      setCouponError("Não foi possível validar o cupom.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const option = PAYMENT_OPTIONS.find((o) => o.id === selectedMethod)!;
      const endpoint = option.gateway === "asaas" ? "/api/checkout-asaas" : "/api/checkout";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productType,
          returnUrl: isSubscription ? window.location.pathname : "/dashboard",
          paymentMethod: selectedMethod,
          customerEmail: user?.primaryEmailAddress?.emailAddress,
          customerName: user?.fullName || user?.username,
          ...(coupon ? { couponCode: coupon.code } : {}),
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar checkout: " + (data.error || "tente novamente."));
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao iniciar checkout.");
      setIsLoading(false);
    }
  };

  const bullets = plan ? PLAN_BULLETS[plan.id] : COURSE_BULLETS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md px-4"
          >
            <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />

              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 text-center mt-2 relative z-10">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-3 block">
                  {isSubscription ? "Assinatura mensal" : "O Primeiro Passo Para o Topo"}
                </span>
                <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase text-glow">
                  {plan ? plan.name : "Workshop Marketing & Posicionamento"}
                </h2>
                <p className="text-sm text-muted-foreground font-light">
                  {isSubscription
                    ? "Sem fidelidade. Cancele quando quiser."
                    : "Você ainda não desbloqueou o workshop completo. Aprenda a se posicionar como autoridade e atrair clientes que pagam caro."}
                </p>
              </div>

              <div className="space-y-3 mb-6 relative z-10">
                {bullets.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-foreground/50 shrink-0" />
                    <span className="text-sm font-medium text-foreground/80">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="glass p-4 rounded-xl border border-border/20 mb-4 relative z-10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Investimento</p>
                {isSubscription ? (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {coupon && <span className="text-sm text-muted-foreground line-through">{formatBRL(basePrice)}</span>}
                    <span className="text-2xl font-black text-foreground">{formatBRL(price)}</span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-black text-foreground">
                        12x de {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ou {coupon && <span className="line-through mr-1">{basePrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>}
                      {price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} à vista
                    </p>
                  </>
                )}
                {coupon && (
                  <p className="text-xs text-green-500 font-semibold mt-2">
                    Cupom {coupon.code} aplicado: {coupon.label}
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="mb-5 relative z-10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Cupom de desconto</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        if (coupon) setCoupon(null);
                        setCouponError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                      placeholder="Digite o código"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-foreground uppercase placeholder:normal-case placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    disabled={!couponInput.trim() || isValidating}
                    className="px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold disabled:opacity-50"
                  >
                    {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
                  </button>
                </div>
                {couponError && <p className="text-xs text-red-500 mt-2">{couponError}</p>}
              </div>

              {/* Payment method selector */}
              <div className="mb-5 relative z-10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Forma de pagamento</p>
                <div className={`grid gap-2 ${options.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
                  {options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedMethod(option.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        selectedMethod === option.id
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                      }`}
                    >
                      {option.icon}
                      <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">{option.label}</span>
                      <span className="text-[9px] leading-tight opacity-70">
                        {isSubscription ? "Cobrança mensal automática" : option.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full metallic-gradient text-black font-bold uppercase tracking-[0.2em] text-[12px] h-14 rounded-xl hover:scale-[1.02] transition-transform border-0 neon-glow flex items-center justify-center gap-2 relative z-10 disabled:opacity-70 disabled:hover:scale-100"
              >
                <span>
                  {isLoading
                    ? "Processando..."
                    : isSubscription
                    ? "Assinar com Cartão"
                    : selectedMethod === "PIX"
                    ? "Pagar com Pix"
                    : selectedMethod === "BOLETO"
                    ? "Gerar Boleto"
                    : "Comprar com Cartão"}
                </span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors mt-4 relative z-10"
              >
                Continuar explorando por enquanto
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
