"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Search, Bell, BookOpen, Compass, Users, Bot, Download, User, Radio } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NotificationPanel } from "./NotificationPanel";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";
import { LoginModal } from "./LoginModal";
import { isAdminUser } from "@/lib/admin";

function UserDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!user) return null;

  const isAdmin = isAdminUser(user.primaryEmailAddress?.emailAddress, user.publicMetadata);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20 overflow-hidden"
      >
        {user.hasImage ? (
          <img src={user.imageUrl} alt={user.fullName || "Perfil"} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-white">
            {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.primaryEmailAddress?.emailAddress.charAt(0).toUpperCase()}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 glass rounded-xl border border-white/10 shadow-2xl py-2 z-50 flex flex-col"
          >
            <div className="px-4 py-2 border-b border-white/10 mb-2">
              <p className="text-sm font-medium text-white">{user.fullName || "Usuário"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            
            <Link 
              href="/dashboard" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Painel do Aluno
            </Link>

            {isAdmin && (
              <Link 
                href="/admin" 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm text-primary hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Painel Admin
              </Link>
            )}
            
            <div className="h-px w-full bg-white/10 my-1" />
            
            <button 
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2 transition-colors text-left w-full"
            >
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isSignedIn: isLoggedIn } = useAuth();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'OPEN_REGISTER') {
        setAuthView('register');
        setIsLoginOpen(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);


  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "CURSOS", path: "/courses" },
    { name: "TOOLS", path: "/tools" },
    ...(isLoggedIn ? [{ name: "DASHBOARD", path: "/dashboard" }] : []),
  ];

  // Same sections as the dashboard sidebar (components handled in
  // app/dashboard/layout.tsx) -- that sidebar is desktop-only (`hidden
  // lg:flex`), so on mobile this menu is the ONLY way a logged-in user can
  // reach Aulas/Ferramentas/etc. It was missing entirely before, which is
  // what surfaced as "no menu after logging in on mobile."
  const dashboardLinks = [
    { name: "Meu Aprendizado", path: "/dashboard", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Ao Vivo", path: "/dashboard/lives", icon: <Radio className="w-4 h-4" /> },
    { name: "Comunidade", path: "/dashboard/community", icon: <Users className="w-4 h-4" /> },
    { name: "Especialistas", path: "/dashboard/tools", icon: <Bot className="w-4 h-4" /> },
    { name: "Minhas Matérias", path: "/dashboard/courses", icon: <Compass className="w-4 h-4" /> },
    { name: "Biblioteca", path: "/dashboard/library", icon: <Download className="w-4 h-4" /> },
    { name: "Meu Perfil", path: "/dashboard/profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} initialView={authView} />
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/20 bg-background/80 backdrop-blur-md transition-colors h-[72px]">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-foreground" style={{ width: 28, height: 28 }}>
              <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
            </svg>
            <span className="font-black text-[18px] tracking-[-0.5px] uppercase text-foreground">
              Ink Authority
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-[12px] uppercase tracking-[0.28em] font-light">
            {!isLoggedIn && (
              <div className="flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      "transition-colors hover:text-foreground relative py-2",
                      pathname === link.path ? "text-foreground font-medium" : "text-foreground/70"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="flex items-center gap-4 relative ml-4">
              {/* Search Bar & Notifications (Only for logged in users) */}
              {isLoggedIn && (
                <>
                  <div className="flex items-center">
                    <AnimatePresence>
                      {isSearchOpen && (
                        <motion.div 
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 200, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          className="overflow-hidden mr-2"
                        >
                          <input 
                            type="text"
                            placeholder="Pesquisar..."
                            className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 px-4 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button 
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="p-2 text-muted-foreground hover:text-white transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="p-2 text-muted-foreground hover:text-white transition-colors relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full neon-glow" />
                    </button>
                    <NotificationPanel 
                      isOpen={isNotificationsOpen} 
                      onClose={() => setIsNotificationsOpen(false)} 
                    />
                  </div>

                  <div className="ml-2 flex items-center justify-center">
                    <UserDropdown />
                  </div>
                </>
              )}

              <div className="h-4 w-px bg-white/10 mx-1" />

              {!isLoggedIn && (
                <div className="flex items-center gap-3">
                  <button 
                    className="text-foreground/70 hover:text-foreground"
                    style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 300, letterSpacing: '0.1em', cursor: 'pointer', padding: '8px 16px' }}
                    onClick={() => { setAuthView("login"); setIsLoginOpen(true); }}
                  >
                    Entrar
                  </button>
                  <button 
                    className="bg-foreground text-background transition-opacity hover:opacity-85"
                    style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', padding: '10px 22px', borderRadius: 9999, textDecoration: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setAuthView("register"); setIsLoginOpen(true); }}
                  >
                    Acesso Antecipado
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            {isLoggedIn && (
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-muted-foreground hover:text-white transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full neon-glow" />
              </button>
            )}
            <button 
              className="p-2 text-muted-foreground hover:text-white"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 w-full bg-black/95 border-b border-white/10 p-4 flex flex-col gap-4 md:hidden backdrop-blur-xl"
            >
              {!isLoggedIn && navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "text-sm font-medium px-4 py-2 rounded-lg transition-colors",
                    pathname === link.path ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              {!isLoggedIn && <div className="h-px w-full bg-white/10 my-2" />}
              {!isLoggedIn ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-white"
                    onClick={() => {
                      setIsOpen(false);
                      setAuthView("login");
                      setIsLoginOpen(true);
                    }}
                  >
                    Entrar
                  </Button>
                  <Button 
                    className="w-full metallic-gradient text-black border-0"
                    onClick={() => {
                      setIsOpen(false);
                      setAuthView("register");
                      setIsLoginOpen(true);
                    }}
                  >
                    Acesso Antecipado
                  </Button>
                </>
              ) : (
                <>
                  {dashboardLinks.map((link) => (
                    <Link
                      key={link.path}
                      href={link.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 text-sm font-medium px-4 py-2 rounded-lg transition-colors",
                        pathname === link.path ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  ))}
                  <div className="h-px w-full bg-white/10 my-2" />
                  <div className="flex items-center gap-4 px-4 py-2 justify-between">
                    <span className="text-sm font-medium text-white/60">Minha Conta</span>
                    <UserDropdown />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
