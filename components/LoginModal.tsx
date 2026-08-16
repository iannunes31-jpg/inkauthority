// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, ArrowRight, User, Phone, Instagram, Upload, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { useSignUp, useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "register";
}

export function LoginModal({ isOpen, onClose, initialView = "login" }: LoginModalProps) {
  const router = useRouter();
  const { setActive } = useClerk();
  const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn } = useSignIn();

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

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setPendingVerification(false);
      setErrorMsg("");
      setPassword("");
      setCode("");
    }
  }, [isOpen, initialView]);

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
      const result = await signUp.create({
        emailAddress: email,
        password: password,
        firstName: nome.split(" ")[0] || "",
        lastName: nome.split(" ").slice(1).join(" ") || "",
        unsafeMetadata: { telefone, instagram }
      });

      if (result && result.status === "complete") {
        onClose();
        window.location.href = "/dashboard";
        return;
      }
      
      // Fallback para caso o signUp já esteja completo
      if (signUp.status === "complete") {
        onClose();
        window.location.href = "/dashboard";
        return;
      }

      // 2. Prepara a verificação por código no email
      try {
        if (signUp.verifications && typeof signUp.verifications.sendEmailCode === 'function') {
           await signUp.verifications.sendEmailCode();
        } else if (signUp.prepareEmailAddressVerification) {
           await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        } else if (result && (result as any).prepareEmailAddressVerification) {
           await (result as any).prepareEmailAddressVerification({ strategy: "email_code" });
        } else {
           await (signUp as any).prepareVerification({ strategy: "email_code" });
        }
      } catch (e: any) {
         console.error("Falha ao preparar verificação:", e);
         throw new Error(`Erro ao enviar código: ${e.message}`);
      }
      
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Erro no Clerk Sign Up:", err);
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Erro de conexão com o servidor de autenticação.";
      setErrorMsg(errorMessage);
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
      let result;
      const errors = [];
      
      try { 
         result = await (signUp as any).attemptEmailAddressVerification({ code }); 
      } catch(e: any) { errors.push("1.attemptEmail: " + (e.message || "error")); }
      
      if (!result) {
         try { 
            result = await (signUp as any).attemptVerification({ strategy: "email_code", code }); 
         } catch(e: any) { errors.push("2.attemptVerif: " + (e.message || "error")); }
      }
      
      if (!result && signUp.verifications) {
         try { 
            result = await (signUp.verifications as any).verifyEmailCode({ code }); 
         } catch(e: any) { errors.push("3.verifyEmail: " + (e.message || "error")); }
      }
      
      if (!result) {
         throw new Error("Falhas no Clerk: " + errors.join(" | "));
      }
      
      if (result && result.status === "complete") {
        onClose();
        window.location.href = "/dashboard";
      } else if (signUp.status === "complete") {
        onClose();
        window.location.href = "/dashboard";
      } else if (result && result.status === "missing_requirements") {
        setErrorMsg(`Quase lá! Faltam os campos obrigatórios no painel do Clerk: ${result.missingFields?.join(", ") || "desconhecidos"}`);
      } else if (signUp.status === "missing_requirements") {
        setErrorMsg(`Quase lá! Faltam os campos obrigatórios no painel do Clerk: ${signUp.missingFields?.join(", ") || "desconhecidos"}`);
      } else {
        setErrorMsg(`Status inesperado: ${result?.status || signUp.status}`);
      }
    } catch (err: any) {
      console.error("Erro no Clerk Verify:", err);
      setErrorMsg(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Erro ao verificar código.");
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
      let result;
      const s = signIn as any;
      const errors = [];

      try {
        if (typeof s.attemptFirstFactor === "function") {
          result = await s.attemptFirstFactor({ strategy: "email_code", code });
        } else if (typeof s.attemptSecondFactor === "function") {
          result = await s.attemptSecondFactor({ strategy: "email_code", code });
        } else if (typeof s.attemptVerification === "function") {
          result = await s.attemptVerification({ strategy: "email_code", code });
        } else if (s.emailCode && typeof s.emailCode.attempt === "function") {
          result = await s.emailCode.attempt({ code });
        } else if (s.emailCode && typeof s.emailCode.verify === "function") {
          result = await s.emailCode.verify({ code });
        } else if (s.emailCode && typeof s.emailCode.verifyCode === "function") {
          result = await s.emailCode.verifyCode({ code });
        } else if (s.verifications && typeof s.verifications.verifyEmailCode === "function") {
          result = await s.verifications.verifyEmailCode({ code });
        } else {
          throw new Error(`Método não encontrado. Chaves do signIn: ${Object.keys(s).join(", ")}. Chaves do emailCode: ${s.emailCode ? Object.keys(s.emailCode).join(", ") : "N/A"}`);
        }
      } catch (err: any) {
        throw err; // throw to be caught by the outer catch
      }

      const status = result?.status || signIn.status;
      if (status === "complete") {
        onClose();
        window.location.href = "/dashboard";
      } else {
        setErrorMsg(`Status inesperado: ${status}`);
      }
    } catch (err: any) {
      console.error("Erro no Clerk Verify SignIn:", err);
      setErrorMsg(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Código inválido.");
    } finally {
      setIsLoading(false);
    }
  };

  // Login usando Email e Senha
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

    try {
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      const status = result?.status || signIn.status;
      const sessionId = result?.createdSessionId || signIn.createdSessionId;

      if (status === "complete") {
        onClose();
        window.location.href = "/dashboard";
      } else if (status === "needs_first_factor" || status === "needs_second_factor" || status === "needs_client_trust") {
        // Envia o código para o email do usuário
        try {
           const s = signIn as any;
           if (typeof s.prepareFirstFactor === "function") {
              await s.prepareFirstFactor({ strategy: "email_code", emailAddressId: s.supportedFirstFactors?.find((f:any) => f.strategy === "email_code")?.emailAddressId });
           } else if (s.prepareSecondFactor && typeof s.prepareSecondFactor === "function") {
              await s.prepareSecondFactor({ strategy: "email_code" });
           } else if (s.prepareVerification && typeof s.prepareVerification === "function") {
              await s.prepareVerification({ strategy: "email_code" });
           } else if (s.emailCode && typeof s.emailCode.sendCode === "function") {
              await s.emailCode.sendCode();
           } else if (s.verifications && typeof s.verifications.sendEmailCode === "function") {
              await s.verifications.sendEmailCode();
           } else {
              throw new Error(`Método não encontrado. Chaves do signIn: ${Object.keys(s).join(", ")}`);
           }
           
           setVerificationType("signin");
           setPendingVerification(true);
        } catch (e: any) {
           console.error("Erro ao preparar fator:", e);
           const errs = e.errors || [];
           const msg = errs.length > 0 ? errs[0].longMessage : e.message;
           setErrorMsg(`Erro ao enviar código: ${msg || JSON.stringify(e)}`);
        }
      } else {
        setErrorMsg(`Erro inesperado ao fazer login. Status: ${status}`);
        console.error("DUMP SignIn result:", JSON.stringify(result));
      }
    } catch (err: any) {
      console.error("Erro no Clerk Sign In:", err);
      setErrorMsg(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Email ou senha incorretos.");
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
                  <div className="text-center mt-4">
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
                <form className="space-y-4 relative z-10" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!email) { setErrorMsg("Digite seu e-mail."); return; }
                  setIsLoading(true); setErrorMsg("");
                  try {
                    await signIn?.create({
                      strategy: "reset_password_email_code",
                      identifier: email,
                    });
                    setPendingVerification(true); // Usado aqui para mostrar a tela de codigo do reset
                  } catch (err: any) {
                    setErrorMsg(err.errors?.[0]?.message || "Erro ao solicitar reset.");
                  } finally {
                    setIsLoading(false);
                  }
                }}>
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
                        onClick={async () => {
                          if (!code || !password) { setErrorMsg("Preencha o código e a nova senha."); return; }
                          setIsLoading(true); setErrorMsg("");
                          try {
                            const result = await signIn?.attemptFirstFactor({
                              strategy: "reset_password_email_code",
                              code,
                              password,
                            });
                            if (result?.status === "complete") {
                              setActive({ session: result.createdSessionId });
                              onClose();
                              window.location.href = "/dashboard";
                            }
                          } catch (err: any) {
                            setErrorMsg(err.errors?.[0]?.message || "Código inválido ou erro ao redefinir.");
                          } finally {
                            setIsLoading(false);
                          }
                        }}
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
