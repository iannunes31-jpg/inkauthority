"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Maximize, Minimize, ShieldCheck, Loader2 } from "lucide-react";
import { TermsContent } from "@/components/TermsContent";
import { TERMS_VERSION } from "@/lib/terms";

interface VideoPlayerProps {
  videoId: string;
  poster?: string;
  className?: string;
  lessonId?: string;
  onProgress?: (percent: number) => void;
}

// Shared across players on the page so the Terms check runs once per visit.
let termsAccepted = false;

export function VideoPlayer({ videoId, poster, className = "", lessonId, onProgress }: VideoPlayerProps) {
  const { user } = useUser();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [terms, setTerms] = useState<"loading" | "pending" | "accepted" | "error">(termsAccepted ? "accepted" : "loading");
  const [showTerms, setShowTerms] = useState(false);
  const [agree, setAgree] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (termsAccepted) return;
    fetch("/api/terms", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        termsAccepted = !!d.accepted;
        setTerms(d.accepted ? "accepted" : "pending");
        if (!d.accepted) setShowTerms(true);
      })
      .catch(() => setTerms("error"));
  }, []);

  const acceptTerms = async () => {
    setAccepting(true);
    const res = await fetch("/api/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: TERMS_VERSION }),
    }).catch(() => null);
    setAccepting(false);
    if (!res?.ok) {
      const body = await res?.json().catch(() => ({}));
      alert(body?.error || "Não foi possível registrar o aceite. Tente de novo.");
      return;
    }
    termsAccepted = true;
    setTerms("accepted");
    setShowTerms(false);
  };

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Our own fullscreen (the wrapper, not the iframe) keeps the watermark on screen.
  // iPhone Safari can't fullscreen a div, so it falls back to filling the viewport.
  const toggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) return document.exitFullscreen();
    if (fullscreen) return setFullscreen(false);
    if (el.requestFullscreen) await el.requestFullscreen().catch(() => setFullscreen(true));
    else setFullscreen(true);
  };

  useEffect(() => {
    if (!lessonId) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        const eventName = data?.name || data?.type || data?.event;
        if (eventName === "timeupdate" || eventName === "stream-timeupdate") {
          const currentTime = data?.data?.currentTime ?? data?.currentTime ?? 0;
          const duration = data?.data?.duration ?? data?.duration ?? 0;
          if (duration > 0 && currentTime > 0) {
            const percent = Math.min(100, Math.round((currentTime / duration) * 100));
            try { localStorage.setItem(`progress_${lessonId}`, String(percent)); } catch {}
            onProgress?.(percent);
          }
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [lessonId]);

  if (!videoId) {
    return (
      <div className={`w-full aspect-video bg-black/50 border border-white/10 rounded-xl flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm">Nenhum vídeo disponível.</p>
      </div>
    );
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const mark = email ? `${email} · ${user!.id.slice(-6)}` : "";

  return (
    <>
      <div
        ref={wrapperRef}
        onContextMenu={(e) => e.preventDefault()}
        className={
          fullscreen && !document.fullscreenElement
            ? "fixed inset-0 z-[100] bg-black"
            : `w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black relative select-none ${className}`
        }
      >
        {terms === "accepted" ? (
          <>
            <iframe
              src={`https://iframe.cloudflarestream.com/${videoId}?controls=true&preload=true&defaultTextTrack=pt${poster ? `&poster=${encodeURIComponent(poster)}` : ""}`}
              allow="accelerometer; gyroscope; autoplay; encrypted-media;"
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
            {mark && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute inset-0 flex flex-wrap content-around justify-around -rotate-12 scale-125 opacity-[0.04]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i} className="text-white text-xs font-semibold whitespace-nowrap px-6 py-8">{mark}</span>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/15"
              aria-label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
              title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
            {terms === "loading" ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : terms === "error" ? (
              <p className="text-sm text-muted-foreground">Não foi possível carregar a aula. Recarregue a página.</p>
            ) : (
              <>
                <ShieldCheck className="w-8 h-8 text-primary" />
                <p className="text-sm text-muted-foreground max-w-sm">Para assistir, leia e aceite os Termos de Uso das Stream Classes.</p>
                <button onClick={() => setShowTerms(true)} className="bg-primary text-primary-foreground text-sm font-bold px-5 py-2.5 rounded-full">
                  Ler e aceitar os Termos
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showTerms && terms === "pending" && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 pb-3 border-b border-white/10">
              <h2 className="text-xl font-black flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" /> Termos de Uso</h2>
              <p className="text-xs text-muted-foreground mt-1">Leia com atenção antes de acessar as Stream Classes.</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <TermsContent />
            </div>
            <div className="p-6 pt-4 border-t border-white/10 space-y-4">
              <label className="flex items-start gap-3 text-sm cursor-pointer">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-primary w-4 h-4" />
                <span>
                  Li e concordo com os Termos de Uso. Entendo que gravar a tela, tirar prints ou compartilhar o conteúdo pode levar ao bloqueio definitivo da minha conta e à perda do acesso às Stream Classes.
                </span>
              </label>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowTerms(false)} className="text-sm text-muted-foreground px-4 py-2.5">Agora não</button>
                <button
                  onClick={acceptTerms}
                  disabled={!agree || accepting}
                  className="bg-primary text-primary-foreground text-sm font-bold px-5 py-2.5 rounded-full disabled:opacity-40 flex items-center gap-2"
                >
                  {accepting && <Loader2 className="w-4 h-4 animate-spin" />} Aceitar e continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
