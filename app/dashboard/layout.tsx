"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Compass, Trophy, Download, History, Settings, User, Users, Bot } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const menuItems = [
    { name: "Meu Aprendizado", path: "/dashboard", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Comunidade", path: "/dashboard/community", icon: <Users className="w-5 h-5" /> },
    { name: "Ferramentas IA", path: "/dashboard/tools", icon: <Bot className="w-5 h-5" /> },
    { name: "Progresso", path: "/dashboard/progress", icon: <Trophy className="w-5 h-5" /> },
    { name: "Meus Cursos", path: "/dashboard/courses", icon: <Compass className="w-5 h-5" /> },
    { name: "Biblioteca", path: "/dashboard/library", icon: <Download className="w-5 h-5" /> },
    { name: "Histórico", path: "/dashboard/history", icon: <History className="w-5 h-5" /> },
    { name: "Meu Perfil", path: "/dashboard/profile", icon: <User className="w-5 h-5" /> },
  ];

  const bottomItems = [
    { name: "Perfil", path: "/dashboard/profile", icon: <User className="w-5 h-5" /> },
    { name: "Configurações", path: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
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
    </div>
  );
}
