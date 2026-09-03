"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Compass, Trophy, Download, History, Settings, User, Users, Bot, Radio, ArrowRight } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

import { AITutorWidget } from "@/components/AITutorWidget";
import { PurchaseCourseModal } from "@/components/PurchaseCourseModal";

const FLAGSHIP_PRODUCT_ID = "marketing_posicionamento";
const PURCHASE_MODAL_SESSION_KEY = "ia_purchase_modal_shown";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userId, signOut } = useAuth();

  // Free areas (community, library/PDFs, etc.) don't require buying the
  // flagship course, so closing the popup shouldn't lose the offer --
  // it collapses into a small neon button that stays on screen (across
  // every dashboard page, not just this one) so it's still one click away
  // whenever the person decides they want it.
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('user_purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', FLAGSHIP_PRODUCT_ID)
          .maybeSingle();

        const purchased = !!data;
        setHasPurchased(purchased);

        if (!purchased && !sessionStorage.getItem(PURCHASE_MODAL_SESSION_KEY)) {
          setShowPurchaseModal(true);
          sessionStorage.setItem(PURCHASE_MODAL_SESSION_KEY, '1');
        }
      } catch (err) {
        console.error("Erro ao verificar compra do curso:", err);
      }
    })();
  }, [userId]);

  const menuItems = [
    { name: "Meu Aprendizado", path: "/dashboard", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Ao Vivo", path: "/dashboard/lives", icon: <Radio className="w-5 h-5" /> },
    { name: "Comunidade", path: "/dashboard/community", icon: <Users className="w-5 h-5" /> },
    { name: "Especialistas", path: "/dashboard/tools", icon: <Bot className="w-5 h-5" /> },
    { name: "Minhas Matérias", path: "/dashboard/courses", icon: <Compass className="w-5 h-5" /> },
    { name: "Biblioteca", path: "/dashboard/library", icon: <Download className="w-5 h-5" /> },
    { name: "Meu Perfil", path: "/dashboard/profile", icon: <User className="w-5 h-5" /> },
  ];

  const bottomItems = [
    { name: "Perfil", path: "/dashboard/profile", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen pt-20 flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-20 bottom-0 bg-black/80 backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col z-40">
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">Menu</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                pathname === item.path ? "text-white bg-white/5" : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <div className={cn(
                "transition-colors",
                pathname === item.path ? "text-primary" : "group-hover:text-primary"
              )}>
                {item.icon}
              </div>
              {item.name}
              {pathname === item.path && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-full neon-glow"
                />
              )}
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/5">
          {bottomItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                pathname === item.path ? "text-white bg-white/5" : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <div className="group-hover:text-primary transition-colors">
                {item.icon}
              </div>
              {item.name}
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full relative">
         {children}
      </main>

      {/* Tutor IA Global */}
      <AITutorWidget />

      {/* Oferta do curso completo -- some quando comprado */}
      {hasPurchased === false && (
        <>
          <PurchaseCourseModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
          />

          {!showPurchaseModal && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setShowPurchaseModal(true)}
              className="fixed bottom-24 left-6 z-40 metallic-gradient text-black font-bold uppercase tracking-[0.15em] text-[11px] h-12 px-5 rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition-transform neon-glow"
            >
              Comprar Curso
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}
