"use client";

import { useUser } from "@clerk/nextjs";
import { Camera, Edit2, Mail, Shield, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto pb-20 p-6 lg:p-10 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground">Você precisa estar logado para ver seu perfil.</p>
      </div>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const isVerified = user.primaryEmailAddress?.verification?.status === "verified";

  return (
    <div className="max-w-4xl mx-auto pb-20 p-6 lg:p-10 flex flex-col items-center">
      <div className="w-full mb-10 text-left">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie sua conta, foto de perfil e informações de segurança.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* Coluna da Esquerda - Foto e Ações Básicas */}
        <div className="glass rounded-2xl border border-white/5 p-8 flex flex-col items-center text-center">
          <div className="relative mb-6 group cursor-pointer">
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary/50 transition-colors bg-white/5 flex items-center justify-center">
              {user.hasImage ? (
                <img src={user.imageUrl} alt="Sua foto" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {user.firstName ? user.firstName.charAt(0).toUpperCase() : email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">{user.fullName || "Usuário"}</h2>
          <p className="text-sm text-muted-foreground mb-6">{email}</p>
          
          <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
            <Edit2 className="w-4 h-4 mr-2" /> Editar Perfil
          </Button>
        </div>

        {/* Coluna da Direita - Detalhes */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Endereços de Email
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="font-medium text-white">{email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isVerified ? (
                    <span className="text-xs text-green-400 flex items-center gap-1"><Shield className="w-3 h-3" /> Verificado</span>
                  ) : (
                    <span className="text-xs text-yellow-400 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Não verificado</span>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">Principal</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                Gerenciar
              </Button>
            </div>
          </div>
          
          <div className="glass rounded-2xl border border-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Segurança da Conta
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 mb-4">
              <div>
                <p className="font-medium text-white">Senha</p>
                <p className="text-xs text-muted-foreground mt-1">Gerencie a proteção do seu acesso</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                Alterar Senha
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="font-medium text-white">Autenticação em Duas Etapas</p>
                <p className="text-xs text-muted-foreground mt-1">Status de proteção da conta</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
