"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Search, Bell } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LoginModal } from "./LoginModal";
import { NotificationPanel } from "./NotificationPanel";
import { useAuth } from "@clerk/nextjs";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [modalView, setModalView] = useState<"login" | "register">("login");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isSignedIn: isLoggedIn } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Cursos", path: "/courses" },
    ...(isLoggedIn ? [{ name: "Dashboard", path: "/dashboard" }] : []),
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 relative group">
            <div className="w-6 h-6 bg-primary rounded-sm rotate-45 flex items-center justify-center neon-glow group-hover:shadow-[0_0_30px_rgba(229,231,235,0.4)] transition-all duration-500">
               <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <span className="font-bold text-[13px] uppercase tracking-[0.2em] text-white ml-2">
              INK AUTHORITY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold">
            {!isLoggedIn && (
              <div className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={cn(
                      "transition-colors hover:text-white relative py-2",
                      pathname === link.path ? "text-white" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                    {pathname === link.path && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full neon-glow"
                        transition={{ type: "spring", bounce: 0.25, stiffness: 130, damping: 9 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}
            
            <div className="h-6 w-px bg-white/10" />
            
            <div className="flex items-center gap-4 relative">
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
                </>
              )}

              <div className="h-4 w-px bg-white/10 mx-1" />

              {!isLoggedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-muted-foreground hover:text-white"
                    onClick={() => {
                      setModalView("login");
                      setIsLoginOpen(true);
                    }}
                  >
                    Entrar
                  </Button>
                  <Button 
                    className="metallic-gradient text-black hover:opacity-90 border-0"
                    onClick={() => {
                      setModalView("register");
                      setIsLoginOpen(true);
                    }}
                  >
                    Matricule-se
                  </Button>
                </>
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
              <div className="h-px w-full bg-white/10 my-2" />
              {!isLoggedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground hover:text-white"
                    onClick={() => {
                      setIsOpen(false);
                      setModalView("login");
                      setIsLoginOpen(true);
                    }}
                  >
                    Entrar
                  </Button>
                  <Button 
                    className="w-full metallic-gradient text-black border-0"
                    onClick={() => {
                      setIsOpen(false);
                      setModalView("register");
                      setIsLoginOpen(true);
                    }}
                  >
                    Matricule-se
                  </Button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        initialView={modalView}
      />
    </>
  );
}
