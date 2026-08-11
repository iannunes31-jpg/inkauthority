"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Edit3, Mail, Shield, Camera, Check, X, Loader2, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleStartEdit = () => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setIsEditingName(true);
    setSuccessMsg("");
  };

  const handleSaveName = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await user.update({ firstName, lastName });
      setSuccessMsg("Nome atualizado com sucesso!");
      setIsEditingName(false);
    } catch (err: any) {
      alert("Erro ao atualizar: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingPhoto(true);
    try {
      await user.setProfileImage({ file });
      setSuccessMsg("Foto atualizada com sucesso!");
    } catch (err: any) {
      alert("Erro ao atualizar foto: " + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const displayName = user?.fullName || user?.username || "Usuário";
  const email = user?.primaryEmailAddress?.emailAddress || "";
  const hasPassword = user?.passwordEnabled;
  const has2FA = user?.twoFactorEnabled;

  return (
    <div className="max-w-3xl mx-auto pb-20 p-6 lg:p-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie sua conta, foto de perfil e informações de segurança.</p>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl px-5 py-3 text-sm font-medium">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna esquerda — foto + nome */}
        <div className="md:col-span-1">
          <div className="glass border border-border/10 rounded-3xl p-6 flex flex-col items-center text-center gap-4">
            {/* Avatar com botão de troca */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {isUploadingPhoto ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
              </label>
            </div>

            {/* Nome editável */}
            {isEditingName ? (
              <div className="w-full space-y-2">
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Primeiro nome"
                  className="w-full bg-foreground/5 border border-border/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Sobrenome"
                  className="w-full bg-foreground/5 border border-border/20 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSaveName} disabled={isSaving} size="sm" className="flex-1 h-8 text-xs bg-primary text-black">
                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Salvar
                  </Button>
                  <Button onClick={() => setIsEditingName(false)} variant="ghost" size="sm" className="flex-1 h-8 text-xs">
                    <X className="w-3 h-3" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-bold text-lg text-foreground">{displayName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
                </div>
                <Button onClick={handleStartEdit} variant="outline" size="sm" className="w-full text-xs gap-2 border-border/20 hover:border-primary/50">
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar Perfil
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Coluna direita — detalhes */}
        <div className="md:col-span-2 space-y-4">
          {/* Email */}
          <div className="glass border border-border/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Endereços de Email</h3>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium">{email}</span>
              <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 rounded-full px-2.5 py-0.5">
                Verificado · Principal
              </span>
            </div>
          </div>

          {/* Segurança */}
          <div className="glass border border-border/10 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Segurança da Conta</h3>
            </div>
            <div className="space-y-3">
              {/* Senha */}
              <div className="flex items-center justify-between py-2 border-b border-border/10">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Senha</p>
                    <p className="text-xs text-muted-foreground">Gerencie a proteção do seu acesso</p>
                  </div>
                </div>
                <span className={`text-xs rounded-full px-2.5 py-0.5 border ${hasPassword ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'}`}>
                  {hasPassword ? "Ativa" : "Não configurada"}
                </span>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Autenticação em Duas Etapas</p>
                    <p className="text-xs text-muted-foreground">Status de proteção da conta</p>
                  </div>
                </div>
                <span className={`text-xs rounded-full px-2.5 py-0.5 border ${has2FA ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-muted text-muted-foreground border-border/20'}`}>
                  {has2FA ? "Ativa" : "Desativada"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
