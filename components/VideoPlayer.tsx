"use client";

import { Stream } from "@cloudflare/stream-react";

interface VideoPlayerProps {
  videoId: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ videoId, poster, className = "" }: VideoPlayerProps) {
  if (!videoId) {
    return (
      <div className={`w-full aspect-video bg-black/50 border border-white/10 rounded-xl flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground text-sm">Nenhum vídeo disponível.</p>
      </div>
    );
  }

  // Se for uma live (stream_key), o id vem acompanhado de outras configs
  // Mas para VOD (Video on Demand) padrão:
  return (
    <div className={`w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black relative ${className}`}>
      <iframe
        src={`https://iframe.cloudflarestream.com/${videoId}?controls=true&preload=true${poster ? `&poster=${encodeURIComponent(poster)}` : ''}`}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  );
}
