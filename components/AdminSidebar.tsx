"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  ShieldAlert,
  Video,
  Users, 
  Megaphone, 
  Share2, 
  Settings,
  LogOut,
  Activity, Ticket, MessageCircle, GraduationCap } from "lucide-react";
import { motion } from "motion/react";

export function AdminSidebar() {
  const pathname = usePathname();

  // Red counter on "Segurança" when the security agent saw something serious in the last 24h.
  const [serious, setSerious] = useState(0);
  useEffect(() => {
    const load = () => fetch("/api/admin/security?summary=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null)).then((d) => setSerious(d?.serious24h ?? 0)).catch(() => {});
    load();
    const t = setInterval(load, 120_000);
    return () => clearInterval(t);
  }, []);

  const links = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Matérias", path: "/admin/courses", icon: <Video className="w-4 h-4" /> },
    { name: "Biblioteca", path: "/admin/library", icon: <Share2 className="w-4 h-4" /> },
    { name: "Lives", path: "/admin/lives", icon: <Activity className="w-4 h-4" /> },
    { name: "Usuários", path: "/admin/users", icon: <Users className="w-4 h-4" /> },
    { name: "Anúncios", path: "/admin/ads", icon: <Megaphone className="w-4 h-4" /> },
    { name: "Afiliados", path: "/admin/affiliates", icon: <Share2 className="w-4 h-4" /> },
    { name: "Provas", path: "/admin/provas", icon: <GraduationCap className="w-4 h-4" /> },
    { name: "Cupons", path: "/admin/cupons", icon: <Ticket className="w-4 h-4" /> },
    { name: "Assistente de Vendas", path: "/admin/assistente", icon: <MessageCircle className="w-4 h-4" /> },
    { name: "Segurança", path: "/admin/seguranca", icon: <ShieldAlert className="w-4 h-4" /> },
    { name: "Ajustes", path: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass border-r border-white/5 flex flex-col z-40 bg-black/80">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 relative group">
          <div className="w-5 h-5 bg-primary rounded-sm rotate-45 flex items-center justify-center neon-glow group-hover:shadow-[0_0_30px_rgba(229,231,235,0.4)] transition-all duration-500">
             <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
          <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-foreground ml-2">
            ADMIN PANEL
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2 px-2">Menu Principal</span>
        {links.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium relative group",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-active"
                  className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10">{link.icon}</div>
              <span className="relative z-10">{link.name}</span>
              {link.path === "/admin/seguranca" && serious > 0 && (
                <span className="relative z-10 ml-auto min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center" title="Eventos graves nas últimas 24h">
                  {serious > 99 ? "99+" : serious}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium text-destructive hover:bg-destructive/10 w-full">
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
