"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { User, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto pb-20 p-6 lg:p-10 text-center">
        <h2 className="text-xl font-bold text-white mb-4">Acesso Negado</h2>
        <p className="text-muted-foreground">Você precisa estar logado para ver seu perfil.</p>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto pb-20 p-6 lg:p-10">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
          <User className="w-8 h-8 text-primary" /> Meu Perfil
        </h1>
        <p className="text-muted-foreground">Gerencie sua conta, senha e informações de segurança.</p>
      </div>

      <div className="glass rounded-2xl border border-white/5 p-4 flex justify-center">
        {/* Usamos o tema dark do Clerk para combinar com nosso SaaS */}
        <UserProfile 
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: "w-full",
              card: "shadow-none bg-transparent w-full max-w-full",
              navbar: "hidden sm:block border-r border-white/10",
              navbarButton: "text-white/70 hover:text-white hover:bg-white/5 data-[active=true]:bg-primary/10 data-[active=true]:text-primary",
              headerTitle: "text-white",
              headerSubtitle: "text-white/50",
              profileSectionTitleText: "text-white/80",
              formButtonPrimary: "bg-primary text-black font-bold hover:bg-primary/90",
              formFieldInput: "bg-black/50 border-white/10 text-white focus:border-primary focus:ring-primary",
              formFieldLabel: "text-white/70",
              dividerLine: "bg-white/10",
              dividerText: "text-white/50",
              badge: "bg-primary/20 text-primary border-primary/20",
              breadcrumbsItem: "text-white/50",
              breadcrumbsItemDivider: "text-white/30",
            }
          }}
        />
      </div>
    </div>
  );
}
