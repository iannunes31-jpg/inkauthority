"use client";

import { motion, AnimatePresence } from "motion/react";
import { Bell, Info, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications = [
  {
    id: 1,
    type: "info",
    title: "Novo Masterclass Disponível",
    message: "Aprenda técnicas de Blackwork com o novo módulo.",
    time: "Há 2 horas",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Certificado Liberado",
    message: "Você concluiu o curso de Biossegurança.",
    time: "Há 1 dia",
    read: true,
  },
  {
    id: 3,
    type: "warning",
    title: "Assinatura Expirando",
    message: "Sua assinatura premium expira em 5 dias.",
    time: "Há 3 dias",
    read: true,
  },
];

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay to close when clicking outside */}
          <div className="fixed inset-0 z-[55]" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute top-16 right-0 z-[60] w-80 sm:w-96 glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden origin-top-right"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
              <h3 className="font-bold text-sm uppercase tracking-widest text-white flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </h3>
              <button 
                onClick={onClose}
                className="text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {mockNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-white/5 flex gap-4 transition-colors hover:bg-white/5 cursor-pointer ${
                    !notif.read ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${!notif.read ? "text-white" : "text-muted-foreground"}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-white neon-glow"></span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-mono">
                      {notif.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/5 bg-black/40 text-center">
              <button className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                Marcar todas como lidas
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
