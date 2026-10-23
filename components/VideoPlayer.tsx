"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Maximize, Minimize, ShieldCheck, Loader2, SkipForward, X } from "lucide-react";
import { TermsContent } from "@/components/TermsContent";
import { TERMS_VERSION } from "@/lib/terms";

interface VideoPlayerProps {
  videoId: string;
  poster?: string;
  className?: string;
  lessonId?: string;
  onProgress?: (percent: number) => void;
  /** The lesson that comes after this one; shows "next lesson" near the end and plays it automatically. */
  next?: { title: string; onGo: () => void };
  autoplay?: boolean;
}

// Shared across players on the page so the Terms check runs once per visit.
let termsAccepted = false;

const NEXT_BUTTON_SECONDS = 20; // "Próxima aula" shows up this long before the end
const AUTO_NEXT_SECONDS = 5; // countdown after the video ends

// Cloudflare's player SDK: gives currentTime/duration and the "ended" event of the iframe player.
let sdkPromise: Promise<any> | null = null;
function loadStreamSdk() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).Stream) return Promise.resolve((window as any).Stream);
  sdkPromise ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://embed.cloudflarestream.com/embed/sdk.latest.js";
    script.onload = () => resolve((window as any).Stream ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export function VideoPlayer({ videoId, poster, className = "", lessonId, onProgress, next, autoplay }: VideoPlayerProps) {
  const { user } = useUser();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [nearEnd, setNearEnd] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const nextRef = useRef(next);
  nextRef.current = next;
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

  // Progress, "next lesson" near the end and the countdown when the video finishes.
  useEffect(() => {
    setNearEnd(false);
    setCountdown(null);
    if (terms !== "accepted" || !iframeRef.current) return;
    let player: any = null;
    let cancelled = false;
    // The SDK doesn't always report the duration; the video's HLS playlist always has it.
    let knownDuration = 0;
    fetch(`https://videodelivery.net/${videoId}/manifest/video.m3u8`)
      .then((r) => r.text())
      .then(async (master) => {
        const rendition = master.split("\n").find((l) => l && !l.startsWith("#"));
        if (!rendition) return;
        const playlist = await (await fetch(new URL(rendition, `https://videodelivery.net/${videoId}/manifest/`).href)).text();
        knownDuration = [...playlist.matchAll(/#EXTINF:([\d.]+)/g)].reduce((sum, m) => sum + Number(m[1]), 0);
      })
      .catch(() => {});
    loadStreamSdk().then((Stream) => {
      if (cancelled || !Stream || !iframeRef.current) return;
      player = Stream(iframeRef.current);
      (iframeRef.current as any).__player = player;
      player.addEventListener("timeupdate", () => {
        const current = player.currentTime || 0;
        const duration = player.duration || knownDuration;
        if (!duration) return;
        const percent = Math.min(100, Math.round((current / duration) * 100));
        if (lessonId) try { localStorage.setItem(`progress_${lessonId}`, String(percent)); } catch {}
        onProgress?.(percent);
        setNearEnd(duration - current <= NEXT_BUTTON_SECONDS);
      });
      player.addEventListener("ended", () => {
        if (nextRef.current) setCountdown(AUTO_NEXT_SECONDS);
      });
    });
    return () => { cancelled = true; };
  }, [videoId, terms]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { setCountdown(null); nextRef.current?.onGo(); return; }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

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
              key={videoId}
              ref={iframeRef}
              src={`https://iframe.cloudflarestream.com/${videoId}?controls=true&preload=true&defaultTextTrack=pt${autoplay ? "&autoplay=true" : ""}${poster ? `&poster=${encodeURIComponent(poster)}` : ""}`}
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

            {next && countdown !== null && (
              <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Próxima aula em {countdown}s</p>
                <p className="text-xl sm:text-2xl font-bold text-white mt-2 max-w-lg">{next.title}</p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setCountdown(null); next.onGo(); }} className="flex items-center gap-2 bg-white text-black font-bold text-sm px-5 py-2.5 rounded-full">
                    <SkipForward className="w-4 h-4" /> Assistir agora
                  </button>
                  <button onClick={() => setCountdown(null)} className="flex items-center gap-2 border border-white/30 text-white text-sm px-5 py-2.5 rounded-full">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              </div>
            )}
            {next && nearEnd && countdown === null && (
              <button
                onClick={next.onGo}
                className="absolute bottom-16 right-4 z-10 flex items-center gap-2 bg-white text-black font-bold text-sm pl-4 pr-5 py-2.5 rounded-full shadow-xl animate-in fade-in slide-in-from-right-4 max-w-[70%]"
              >
                <SkipForward className="w-4 h-4 shrink-0" />
                <span className="truncate">Próxima aula: {next.title}</span>
              </button>
            )}
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
