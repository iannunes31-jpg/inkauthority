"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ImagePlus, X, Download, RefreshCw, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdsAccessGate } from "@/components/AdsAccessGate";
import { cn } from "@/lib/utils";

type Format = "feed" | "quadrado" | "stories";

const FORMATS: { id: Format; label: string; hint: string; aspect: string }[] = [
  { id: "feed", label: "Feed", hint: "4:5", aspect: "aspect-[4/5]" },
  { id: "quadrado", label: "Quadrado", hint: "1:1", aspect: "aspect-square" },
  { id: "stories", label: "Stories", hint: "9:16", aspect: "aspect-[9/16]" },
];

const IDEAS = [
  "Arte de divulgação da minha agenda aberta para o próximo mês, com a frase \"Agenda aberta\" em destaque",
  "Post de promoção de flash tattoo com o texto \"Flash day — sábado\"",
  "Criativo para anúncio mostrando essa tatuagem como destaque, estilo premium e escuro",
  "Post de depoimento de cliente com espaço para a frase \"Melhor experiência que já tive\"",
];

// Keeps the request well under Vercel's 4.5MB body limit.
async function resizeToBase64(file: File, max = 1536): Promise<{ base64: string; previewUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  return { base64: dataUrl.split(",")[1], previewUrl: dataUrl };
}

export default function CriativoPage() {
  const [photo, setPhoto] = useState<{ base64: string; previewUrl: string } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState<Format>("feed");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{ url: string; format: Format }[]>([]);
  const [selected, setSelected] = useState(0);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    try {
      setPhoto(await resizeToBase64(file));
    } catch {
      setError("Não foi possível ler essa imagem. Use JPG, PNG ou WEBP.");
    }
  };

  const generate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/criativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          format,
          ...(photo ? { imageBase64: photo.base64, mimeType: "image/jpeg" } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.imageBase64) throw new Error(data.error || "Erro ao gerar a arte.");
      const url = `data:${data.imageMimeType};base64,${data.imageBase64}`;
      setResults((prev) => [{ url, format }, ...prev]);
      setSelected(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const current = results[selected];
  const currentAspect = FORMATS.find((f) => f.id === (current?.format ?? format))!.aspect;

  return (
    <AdsAccessGate>
      <div className="max-w-6xl mx-auto pb-20">
        <div className="px-1 py-4 mb-6 flex items-center gap-4">
          <Link href="/dashboard/tools/anuncios" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter">Criador de Criativos</h1>
            <p className="text-xs text-muted-foreground">Envie uma foto, descreva a arte e receba um criativo pronto para postar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3 block">
                Foto <span className="normal-case tracking-normal text-white/40">(opcional)</span>
              </label>
              {photo ? (
                <div className="relative w-40 rounded-xl overflow-hidden border border-white/10">
                  <img src={photo.previewUrl} alt="Foto enviada" className="w-full h-auto" />
                  <button
                    onClick={() => setPhoto(null)}
                    className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500/80 p-1 rounded-lg transition-colors"
                    aria-label="Remover foto"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="w-full bg-black/50 border border-white/10 border-dashed rounded-xl py-8 px-3 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400/60 hover:bg-white/5 transition-colors">
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  <ImagePlus className="w-6 h-6 text-white/50 mb-2" />
                  <span className="text-sm font-semibold text-white/70">Clique para enviar uma foto</span>
                  <span className="text-[11px] text-white/40 mt-1">Tatuagem, estúdio, você trabalhando...</span>
                </label>
              )}
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3 block">
                O que você quer na arte?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={1500}
                rows={5}
                placeholder='Ex: Post anunciando agenda aberta para outubro, com a frase "Últimas vagas" e meu @ink.studio no rodapé'
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-3 text-sm focus:border-rose-400 focus:outline-none transition-colors resize-none"
              />
              <p className="text-[11px] text-white/40 mt-2">
                Escreva exatamente os textos que devem aparecer (frases, @, telefone, preço). A IA não inventa esses dados.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {IDEAS.map((idea) => (
                  <button
                    key={idea}
                    onClick={() => setPrompt(idea)}
                    className="text-left text-[11px] bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-400/30 rounded-xl px-3 py-2 transition-all text-muted-foreground hover:text-foreground"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass p-6 rounded-2xl border border-white/5">
              <label className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-3 block">Formato</label>
              <div className="grid grid-cols-3 gap-3">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      format === f.id ? "border-rose-400 bg-rose-500/10 text-white" : "border-white/10 bg-black/40 text-white/50 hover:bg-white/5"
                    )}
                  >
                    <div className="text-sm font-bold">{f.label}</div>
                    <div className="text-[10px] opacity-70">{f.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">{error}</div>
            )}

            <Button
              onClick={generate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full h-12 bg-gradient-to-r from-rose-600 to-orange-500 hover:opacity-90 text-white font-bold uppercase tracking-widest text-[11px] rounded-xl"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando sua arte...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Gerar Criativo</>
              )}
            </Button>
          </div>

          {/* Result */}
          <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-4">Resultado</p>
            <div className={cn("w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center", currentAspect)}>
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3 text-white/50">
                  <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
                  <span className="text-xs">Isso leva uns 10 a 30 segundos</span>
                </div>
              ) : current ? (
                <img src={current.url} alt="Criativo gerado" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/30 px-6 text-center">
                  <Sparkles className="w-8 h-8" />
                  <span className="text-xs">Sua arte aparece aqui</span>
                </div>
              )}
            </div>

            {current && !isGenerating && (
              <div className="grid grid-cols-2 gap-3 mt-5 max-w-sm mx-auto w-full">
                <a href={current.url} download={`criativo-ink-authority-${Date.now()}.png`}>
                  <Button className="w-full bg-white text-black hover:bg-white/90 font-bold text-xs">
                    <Download className="w-4 h-4 mr-2" /> Baixar
                  </Button>
                </a>
                <Button onClick={generate} variant="outline" className="w-full font-bold text-xs border-white/20">
                  <RefreshCw className="w-4 h-4 mr-2" /> Outra versão
                </Button>
              </div>
            )}

            {results.length > 1 && (
              <div className="mt-6">
                <p className="text-[11px] text-white/40 mb-2">Versões geradas nesta sessão</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {results.map((r, i) => (
                    <button
                      key={r.url.slice(-32) + i}
                      onClick={() => setSelected(i)}
                      className={cn(
                        "w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors",
                        i === selected ? "border-rose-400" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={r.url} alt={`Versão ${results.length - i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdsAccessGate>
  );
}
