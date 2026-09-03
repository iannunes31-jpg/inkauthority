"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, CheckCircle2 } from "lucide-react";

interface PurchaseCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FLAGSHIP_PRODUCT_ID = "marketing_posicionamento";

export function PurchaseCourseModal({ isOpen, onClose }: PurchaseCourseModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: FLAGSHIP_PRODUCT_ID,
          productType: "catalog",
          returnUrl: "/dashboard",
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erro ao iniciar checkout.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão ao iniciar checkout.");
      setIsLoading(false);
    }
  };

  const bullets = [
    "Posicionamento e estruturação das suas redes sociais",
    "Técnicas de vendas e conversão de clientes",
    "Acesso à comunidade exclusiva da Ink Authority",
  ];

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
                className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 text-center mt-2 relative z-10">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-3 block">
                  O Primeiro Passo Para o Topo
                </span>
                <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase text-glow">
                  Curso Marketing &amp; Posicionamento
                </h2>
                <p className="text-sm text-muted-foreground font-light">
                  Você ainda não desbloqueou o curso completo. Aprenda a se posicionar como autoridade e atrair clientes que pagam caro.
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

              <div className="glass p-4 rounded-xl border border-border/20 mb-4 flex items-center justify-between gap-4 relative z-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Investimento</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">R$ 997,00</span>
                  </div>
                  <p className="text-xs text-primary mt-1">Ou 12x de R$ 99,70</p>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full metallic-gradient text-black font-bold uppercase tracking-[0.2em] text-[12px] h-14 rounded-xl hover:scale-[1.02] transition-transform border-0 neon-glow flex items-center justify-center gap-2 relative z-10 disabled:opacity-70 disabled:hover:scale-100"
              >
                <span>{isLoading ? "Processando..." : "Comprar Curso"}</span>
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="w-full text-center text-xs text-muted-foreground hover:text-white transition-colors mt-4 relative z-10"
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
