"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Uploads one image to Storage through a signed URL and hands back its public URL.
export function ImageUpload({
  value,
  onChange,
  folder = "course-covers",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) return setError("Escolha um arquivo de imagem (JPG, PNG ou WEBP).");
    if (file.size > 10 * 1024 * 1024) return setError("A imagem precisa ter no máximo 10 MB.");
    setUploading(true);
    try {
      const res = await fetch("/api/ai-settings/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, files: [{ ext: file.name.split(".").pop() || "jpg" }] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Falha ao preparar o upload.");
      const { path, token, publicUrl } = data.uploads[0];
      const { error: upErr } = await supabase.storage.from("assets").uploadToSignedUrl(path, token, file, {
        contentType: file.type || undefined,
      });
      if (upErr) throw upErr;
      onChange(publicUrl);
    } catch (err: any) {
      setError(err.message || "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {value ? (
        <div className="relative aspect-video rounded-xl border border-white/10 overflow-hidden bg-black group">
          <img src={value} alt="Capa" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/20"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Trocar imagem
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              className="flex items-center gap-1.5 bg-black/70 hover:bg-red-600/80 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-white/20"
              aria-label="Remover imagem"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={uploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-white/15 hover:border-primary/60 hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
        >
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-sm">Enviando imagem…</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-8 h-8" />
              <span className="text-sm font-semibold text-foreground">Clique para enviar a capa</span>
              <span className="text-xs">ou arraste a imagem aqui · JPG, PNG ou WEBP até 10 MB · ideal 1280×720</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
