"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Megaphone, 
  Share2, 
  Settings,
  LogOut
} from "lucide-react";
import { motion } from "motion/react";

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Cursos", path: "/admin/courses", icon: <Video className="w-4 h-4" /> },
    { name: "Usuários", path: "/admin/users", icon: <Users className="w-4 h-4" /> },
    { name: "Anúncios", path: "/admin/ads", icon: <Megaphone className="w-4 h-4" /> },
    { name: "Afiliados", path: "/admin/affiliates", icon: <Share2 className="w-4 h-4" /> },
    { name: "Ajustes", path: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass border-r border-white/5 flex flex-col z-40 bg-black/80">
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 relative group">
          <div className="w-5 h-5 bg-primary rounded-sm rotate-45 flex items-center justify-center neon-glow group-hover:shadow-[0_0_30px_rgba(229,231,235,0.4)] transition-all duration-500">
             <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
          <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-white ml-2">
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
                isActive ? "text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
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
