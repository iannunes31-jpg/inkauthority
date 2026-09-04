"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Play, Lock } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LoginModal } from "@/components/LoginModal";

export default function CoursesPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const { isSignedIn } = useAuth();

  const handleCheckout = async (productId: string) => {
    if (!isSignedIn) {
      setIsLoginOpen(true);
      return;
    }
    try {
      setIsLoadingCheckout(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, productType: 'catalog', returnUrl: '/courses' }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erro ao iniciar checkout.');
        setIsLoadingCheckout(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao iniciar checkout.');
      setIsLoadingCheckout(false);
    }
  };

  const features = [
    "O que é posicionamento e como aplicá-lo à sua carreira artística",
    "Estruturação das suas redes sociais",
    "Criação de conteúdos que atraem clientes",
    "Técnicas de vendas e conversão de clientes",
    "Como utilizar o tráfego pago de forma objetiva",
    "Acesso à comunidade exclusiva da Ink Authority",
    "🎁 BÔNUS: Análise de perfil grátis (para os 20 primeiros)",
  ];

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-64 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-64 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center mt-12">
        
        {/* Left Content - Sales Pitch */}
        <div className="flex-1 space-y-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary mb-4 block">
              O Primeiro Passo Para o Topo
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tighter text-glow leading-tight">
              Posicionamento para <span className="text-foreground">tatuadores</span>
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              Não basta ser o melhor tatuador se ninguém conhece o seu trabalho. Aprenda os segredos exatos para se posicionar como autoridade, atrair clientes que pagam caro e transformar sua arte num negócio altamente lucrativo.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-foreground/50" />
                <span className="text-sm font-medium text-foreground/80">{feature}</span>
              </div>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-6"
          >
            <div className="glass p-6 rounded-2xl border border-border/20 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent skeleton-shimmer pointer-events-none" />
              
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Investimento</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-foreground">R$ 997,00</span>
                  <span className="text-sm text-muted-foreground line-through">R$ 1.500,00</span>
                </div>
                <p className="text-xs text-primary mt-1">Ou 12x de R$ 99,70</p>
              </div>

              <Button 
                onClick={() => handleCheckout("marketing_posicionamento")}
                disabled={isLoadingCheckout}
                className="w-full md:w-auto metallic-gradient text-black font-bold uppercase tracking-[0.2em] text-[11px] h-14 px-8 rounded-xl hover:scale-105 transition-transform border-0 group"
                style={{ boxShadow: '0 0 30px rgba(139, 122, 102, 0.3)' }}
              >
                <span>{isLoadingCheckout ? "Processando..." : "Garantir Vaga"}</span>
                {!isLoadingCheckout && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              <Lock className="w-3 h-3" />
              <span>Acesso imediato após o pagamento</span>
            </div>
          </motion.div>
        </div>

        {/* Right Content - Video Preview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 w-full max-w-[500px] lg:max-w-none relative z-10"
        >
          <div className="relative rounded-[2rem] overflow-hidden border border-border/20 shadow-2xl glass group aspect-[4/5] lg:aspect-auto lg:h-[700px]">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover opacity-90 transition-opacity duration-500"
              poster="/isabella_poster.jpg"
            >
              <source src="/video_badini.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
            
            {/* Elegant overlay gradient to make it blend with the theme */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 pointer-events-none" />
            
            {/* Play overlay just for aesthetics (video is autoplaying) */}
            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/10 backdrop-blur-md border border-border/20 flex items-center justify-center pointer-events-none">
                  <Play className="w-5 h-5 text-foreground ml-1" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-sm uppercase tracking-wider">Assista ao Vídeo</p>
                  <p className="text-muted-foreground text-xs">Aumente o som</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Login Modal Integration */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        initialView="register" // Direto para criar a conta
      />
    </main>
  );
}
