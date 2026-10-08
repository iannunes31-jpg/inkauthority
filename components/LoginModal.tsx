"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, ArrowRight, User, Phone, Instagram, Upload, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { useSignUp, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register";
}

// Clerk v7 errors come back as { error } instead of being thrown.
function clerkCode(err: any): string {
  return err?.errors?.[0]?.code || err?.code || "";
}
function clerkText(err: any): string {
  return err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.longMessage || err?.message || "";
}
function friendlyError(err: any, fallback: string): string {
  const code = clerkCode(err);
  switch (code) {
    case "form_password_incorrect":
      return "Senha incorreta. Tente de novo ou use \"Esqueceu a senha?\".";
    case "form_identifier_not_found":
      return "Email não encontrado. Verifique o endereço digitado.";
    case "form_code_incorrect":
      return "Código incorreto. Confira o código enviado para o seu e-mail.";
    case "verification_expired":
      return "Código expirado. Peça um novo código.";
    case "verification_failed":
      return "Muitas tentativas com código errado. Peça um novo código.";
    case "form_password_pwned":
      return "Essa senha apareceu em vazamentos de dados. Escolha outra senha.";
    case "form_password_length_too_short":
      return "A senha deve ter pelo menos 8 caracteres.";
    case "form_identifier_exists":
      return "Já existe uma conta com esse e-mail. Faça login.";
    case "too_many_requests":
    case "user_locked":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  return clerkText(err) || fallback;
}

export function LoginModal({ isOpen, onClose, initialView = "login" }: LoginModalProps) {
  const router = useRouter();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();

  const [view, setView] = useState<"login" | "register" | "forgot">(initialView);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationType, setVerificationType] = useState<"signup" | "signin">("signup");
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [code, setCode] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setPendingVerification(false);
      setErrorMsg("");
      setInfoMsg("");
      setResendCooldown(0);
      setPassword("");
      setCode("");
    }
  }, [isOpen, initialView]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const finishSignIn = async () => {
    const { error } = await signIn.finalize();
    if (error) {
      setErrorMsg(friendlyError(error, "Erro ao concluir o login."));
      return;
    }
    onClose();
    window.location.reload();
  };

  // A new device (needs_client_trust) or MFA (needs_second_factor) asks for
  // an email code before the session is created.
  const startSignInEmailCode = async () => {
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setErrorMsg(friendlyError(error, "Erro ao enviar o código de verificação."));
      return;
    }
    setVerificationType("signin");
    setPendingVerification(true);
    setResendCooldown(30);
    setInfoMsg("Enviamos um código para o seu e-mail (confira o spam).");
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg("");
    setInfoMsg("");
    try {
      let error;
      if (view === "forgot") {
        ({ error } = await signIn.resetPasswordEmailCode.sendCode());
      } else if (verificationType === "signup") {
        ({ error } = await signUp.verifications.sendEmailCode());
      } else {
        ({ error } = await signIn.mfa.sendEmailCode());
      }
      if (error) {
        setErrorMsg(friendlyError(error, "Erro ao reenviar código."));
        return;
      }
      setInfoMsg("Código reenviado! Confira sua caixa de entrada (e o spam).");
      setResendCooldown(30);
    } finally {
      setIsResending(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nome || !password) {
      setErrorMsg("Por favor, preencha Nome, E-mail e Senha.");
      return;
    }
    if (!signUp) {
      setErrorMsg("Conectando ao servidor de segurança... aguarde um segundo e tente novamente.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName: nome.split(" ")[0] || "",
        lastName: nome.split(" ").slice(1).join(" ") || "",
        unsafeMetadata: { telefone, instagram },
      });
      if (error) {
        setErrorMsg(friendlyError(error, "Erro ao criar conta."));
        return;
      }

      if (signUp.status === "complete") {
        const { error: finErr } = await signUp.finalize();
        if (finErr) { setErrorMsg(friendlyError(finErr, "Erro ao concluir cadastro.")); return; }
        onClose();
        window.location.href = "/dashboard";
        return;
      }

      if (signUp.unverifiedFields?.includes("email_address")) {
        const { error: sendErr } = await signUp.verifications.sendEmailCode();
        if (sendErr) { setErrorMsg(friendlyError(sendErr, "Erro ao enviar o código.")); return; }
        setVerificationType("signup");
        setPendingVerification(true);
        setResendCooldown(30);
        return;
      }

      const missing = signUp.missingFields || [];
      setErrorMsg(missing.length > 0
        ? `Campos obrigatórios faltando: ${missing.join(", ")}.`
        : `Não foi possível concluir o cadastro (status: ${signUp.status}).`);
    } catch (err: any) {
      console.error("Erro no Clerk Sign Up:", err);
      setErrorMsg(friendlyError(err, "Erro de conexão com o servidor de autenticação."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setErrorMsg(friendlyError(error, "Código inválido."));
        return;
      }
      if (signUp.status === "complete") {
        const { error: finErr } = await signUp.finalize();
        if (finErr) { setErrorMsg(friendlyError(finErr, "Erro ao concluir cadastro.")); return; }
        onClose();
        window.location.href = "/dashboard";
        return;
      }
      const missing = signUp.missingFields || [];
      setErrorMsg(missing.length > 0
        ? `Quase lá! Faltam campos obrigatórios: ${missing.join(", ")}`
        : `Status inesperado: ${signUp.status}`);
    } catch (err: any) {
      console.error("Erro no Clerk Verify:", err);
      setErrorMsg(friendlyError(err, "Erro ao verificar código."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code });
      if (error) {
        setErrorMsg(friendlyError(error, "Código inválido."));
        return;
      }
      if (signIn.status === "complete") {
        await finishSignIn();
      } else {
        setErrorMsg(`Status inesperado: ${signIn.status}`);
      }
    } catch (err: any) {
      console.error("Erro no Clerk Verify SignIn:", err);
      setErrorMsg(friendlyError(err, "Código inválido."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg("Por favor, digite seu e-mail e senha.");
      return;
    }
    if (!signIn) {
      setErrorMsg("Conectando ao servidor... aguarde um segundo.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const { error } = await signIn.password({ identifier: email.trim(), password });
      if (error) {
        if (clerkCode(error) === "session_exists") {
          onClose();
          window.location.reload();
          return;
        }
        setErrorMsg(friendlyError(error, "Erro ao fazer login. Tente novamente."));
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }
      if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        await startSignInEmailCode();
        return;
      }
      setErrorMsg(`Não foi possível entrar (status: ${signIn.status}).`);
    } catch (err: any) {
      console.error("Erro no Clerk Sign In:", err);
      setErrorMsg(friendlyError(err, "Erro ao fazer login. Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setErrorMsg("Digite seu e-mail."); return; }
    if (!signIn) { setErrorMsg("Conectando ao servidor... aguarde um segundo e tente novamente."); return; }
    setIsLoading(true); setErrorMsg(""); setInfoMsg("");
    try {
      const { error: createErr } = await signIn.create({ identifier: email.trim() });
      if (createErr) { setErrorMsg(friendlyError(createErr, "Erro ao solicitar reset. Verifique o e-mail digitado.")); return; }
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) { setErrorMsg(friendlyError(error, "Erro ao enviar o código.")); return; }
      setCode("");
      setPassword("");
      setPendingVerification(true);
      setResendCooldown(30);
      setInfoMsg("Enviamos um código para o seu e-mail (confira o spam).");
    } catch (err: any) {
      setErrorMsg(friendlyError(err, "Erro ao solicitar reset. Verifique o e-mail digitado."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotReset = async () => {
    if (!code || !password) { setErrorMsg("Preencha o código e a nova senha."); return; }
    if (password.length < 8) { setErrorMsg("A senha deve ter pelo menos 8 caracteres."); return; }
    setIsLoading(true); setErrorMsg(""); setInfoMsg("");
    try {
      // If a previous attempt already verified the code but the password was
      // rejected, skip straight to submitting the new password.
      if (signIn.status !== "needs_new_password") {
        const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
        if (error) { setErrorMsg(friendlyError(error, "Código inválido ou expirado.")); return; }
      }
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (error) { setErrorMsg(friendlyError(error, "Não foi possível salvar a nova senha.")); return; }

      if (signIn.status === "complete") {
        await finishSignIn();
      } else if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
        setView("login");
        await startSignInEmailCode();
      } else {
        setErrorMsg(`Status inesperado: ${signIn.status}`);
      }
    } catch (err: any) {
      setErrorMsg(friendlyError(err, "Código inválido ou erro ao redefinir."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md px-4"
          >
            <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>

              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8 text-center mt-2 relative z-10">
                <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase text-glow">
                  {pendingVerification ? "Verificação" : view === "login" ? "Entrar" : "Criar Conta"}
                </h2>
                <p className="text-sm text-muted-foreground font-light">
                  {pendingVerification 
                    ? "Digite o código que enviamos para o seu e-mail." 
                    : view === "login" 
                      ? "Acesse com seu e-mail e senha." 
                      : "Preencha seus dados para se matricular."}
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4 relative z-10 text-center">
                  {errorMsg}
                </div>
              )}

              {infoMsg && view === "forgot" && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg text-sm mb-4 relative z-10 text-center">
                  {infoMsg}
                </div>
              )}

              {/* TELA DE VERIFICACAO DE CODIGO (SIGN IN / SIGN UP) */}
              {pendingVerification && view !== "forgot" ? (
                <form onSubmit={verificationType === "signup" ? handleVerifySignUp : handleVerifySignIn} className="space-y-4 relative z-10">
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Código de 6 dígitos"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-center tracking-[0.5em] text-lg text-white focus:outline-none focus:border-white/30 transition-colors"
                      maxLength={6}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full group h-12 uppercase font-bold tracking-widest text-[11px] rounded-xl mt-6 neon-glow metallic-gradient text-black hover:opacity-90 border-0">
                    <span>{isLoading ? "Verificando..." : "Confirmar Acesso"}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  {infoMsg && (
                    <p className="text-center text-xs text-green-400">{infoMsg}</p>
                  )}
                  <div className="text-center mt-4 flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || isResending}
                      className="text-xs text-muted-foreground hover:text-white disabled:opacity-50 disabled:hover:text-muted-foreground"
                    >
                      {isResending
                        ? "Reenviando..."
                        : resendCooldown > 0
                          ? `Reenviar código em ${resendCooldown}s`
                          : "Não recebeu? Reenviar código"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingVerification(false)}
                      className="text-xs text-muted-foreground hover:text-white"
                    >
                      Voltar
                    </button>
                  </div>
                </form>

              ) : view === "forgot" ? (
                /* TELA DE ESQUECI A SENHA */
                <form className="space-y-4 relative z-10" onSubmit={handleForgotSendCode}>
                  {!pendingVerification ? (
                    <>
                      <p className="text-sm text-center text-muted-foreground mb-4">Enviaremos um codigo para o seu e-mail para redefinir a senha.</p>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Seu E-mail"
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      <Button type="submit" disabled={isLoading} className="w-full group h-12 uppercase font-bold tracking-widest text-[11px] rounded-xl mt-6 neon-glow metallic-gradient text-black hover:opacity-90 border-0">
                        <span>{isLoading ? "Enviando..." : "Enviar Código"}</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="relative mb-4">
                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="Código de 6 dígitos"
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-center tracking-[0.5em] text-lg text-white focus:outline-none focus:border-white/30 transition-colors"
                          maxLength={6}
                        />
                      </div>
                      <div className="relative mb-4">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Nova Senha"
                          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleForgotReset}
                        disabled={isLoading} 
                        className="w-full group h-12 uppercase font-bold tracking-widest text-[11px] rounded-xl mt-2 neon-glow metallic-gradient text-black hover:opacity-90 border-0"
                      >
                        <span>{isLoading ? "Salvando..." : "Redefinir Senha"}</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </>
                  )}
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => { setView("login"); setPendingVerification(false); }} className="text-xs text-muted-foreground hover:text-white">
                      Voltar para o Login
                    </button>
                  </div>
                </form>

              ) : view === "login" ? (
                /* TELA DE LOGIN */
                <form className="space-y-4 relative z-10" onSubmit={handleSignIn}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu E-mail"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua Senha"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" onClick={() => { setView("forgot"); setPendingVerification(false); }} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      Esqueceu a senha?
                    </button>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full group h-12 uppercase font-bold tracking-widest text-[11px] rounded-xl mt-6 neon-glow metallic-gradient text-black hover:opacity-90 border-0">
                    <span>{isLoading ? "Entrando..." : "Acessar Plataforma"}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>

              ) : (
                /* TELA DE CADASTRO */
                <form className="space-y-4 relative z-10" onSubmit={handleSignUp}>
                  <div className="flex justify-center mb-6">
                    <label className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all group relative overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFoto(file);
                            setFotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Sua Foto" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-muted-foreground mb-1 group-hover:text-white transition-colors" />
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wider group-hover:text-white transition-colors">Foto</span>
                        </>
                      )}
                      
                      {/* Overlay para trocar foto se ja houver uma */}
                      {fotoPreview && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Upload className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Nome Completo"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="Telefone (WhatsApp)"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Seu E-mail principal"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="Link do Instagram (@seu.perfil)"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                  
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crie uma Senha (minimo 8 caracteres)"
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full group h-12 uppercase font-bold tracking-widest text-[11px] rounded-xl mt-6 neon-glow metallic-gradient text-black hover:opacity-90 border-0">
                    <span>{isLoading ? "Processando..." : "Criar Conta"}</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              )}

              {view !== "forgot" && !pendingVerification && (
                <div className="mt-8 pt-6 border-t border-white/5 text-center relative z-10">
                  <p className="text-sm text-muted-foreground font-light">
                    {view === "login" ? "Ainda nao tem uma conta? " : "Ja possui uma conta? "}
                    <button 
                      onClick={() => setView(view === "login" ? "register" : "login")}
                      className="text-white hover:underline font-medium"
                    >
                      {view === "login" ? "Matricule-se" : "Fazer Login"}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
