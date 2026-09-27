"use client";

import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  videoId: string;
  poster?: string;
  className?: string;
  lessonId?: string;
  onProgress?: (percent: number) => void;
}

export function VideoPlayer({ videoId, poster, className = "", lessonId, onProgress }: VideoPlayerProps) {
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

  return (
    <div className={`w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black relative ${className}`}>
      <iframe
        src={`https://iframe.cloudflarestream.com/${videoId}?controls=true&preload=true${poster ? `&poster=${encodeURIComponent(poster)}` : ""}`}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        style={{ border: "none" }}
      />
    </div>
  );
}
