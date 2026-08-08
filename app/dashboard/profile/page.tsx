"use client";

import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 p-6 lg:p-10 flex flex-col items-center">
      <div className="w-full mb-10 text-left">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie sua conta, foto de perfil e informações de segurança.</p>
      </div>
      
      <UserProfile 
        appearance={{
          elements: {
            card: "bg-black/40 border border-white/10 shadow-2xl backdrop-blur-md rounded-2xl w-full",
            navbar: "border-r border-white/5",
            navbarButton: "text-muted-foreground hover:text-white",
            headerTitle: "text-white font-black",
            headerSubtitle: "text-muted-foreground",
            profileSectionTitleText: "text-white font-bold",
            profileSectionPrimaryButton: "text-primary hover:text-primary/80",
            avatarImageActionsUpload: "text-primary",
            formButtonPrimary: "bg-primary text-black hover:bg-primary/90",
            formFieldLabel: "text-white/80",
            formFieldInput: "bg-white/5 border border-white/10 text-white rounded-xl focus:border-primary/50",
            badge: "bg-white/10 text-white",
            dividerLine: "bg-white/10",
            dividerText: "text-muted-foreground",
            userPreviewMainIdentifier: "text-white font-bold",
            userPreviewSecondaryIdentifier: "text-muted-foreground",
          }
        }}
      />
    </div>
  );
}
