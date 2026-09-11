"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Upload, Download, RefreshCw, Contrast, ImagePlus,
  Zap, Loader2, CheckCircle2, SlidersHorizontal, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = "enviar" | "ajustar" | "resultado";
type Style = "linhas" | "sombras" | "fino";

const STYLES: { id: Style; label: string; description: string }[] = [
  { id: "linhas", label: "Linhas Limpas", description: "Contornos e linhas essenciais — o mais comum para decalque" },
  { id: "sombras", label: "Sombras & Blocos", description: "Áreas sólidas preenchidas + contornos, estilo blackwork" },
  { id: "fino", label: "Fine Line", description: "Linhas ultra-finas para tatuagens delicadas e micro-realism" },
];

export default function DecalquePage() {
  const [step, setStep] = useState<Step>("enviar");
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [fileName, setFileName] = useState("");
  const [style, setStyle] = useState<Style>("linhas");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiDescription, setAiDescription] = useState<string>("");
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [invert, setInvert] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_DIM = 2200;

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setImageMimeType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Extract base64 without prefix
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);

      const img = new Image();
      img.onload = () => {
        setImageEl(img);
        setStep("ajustar");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // Draw preview canvas using local threshold (fast preview while AI processes)
  useEffect(() => {
    if (step !== "ajustar" || !imageEl) return;
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = Math.min(1, MAX_DIM / Math.max(imageEl.width, imageEl.height));
      canvas.width = Math.round(imageEl.width * scale);
      canvas.height = Math.round(imageEl.height * scale);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(imageEl, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const v = invert ? (gray > threshold ? 0 : 255) : (gray > threshold ? 255 : 0);
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
    });
  }, [step, imageEl, threshold, invert]);

  const generateWithAI = async () => {
    if (!imageBase64 || isProcessing) return;
    setIsProcessing(true);
    setAiDescription("");

    try {
      const res = await fetch("/api/decalque-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType: imageMimeType, style }),
      });
      const data = await res.json();
      if (data.description) {
        setAiDescription(data.description);
        // For the result display, convert canvas to data URL
        const canvas = canvasRef.current;
        if (canvas) setResultDataUrl(canvas.toDataURL("image/png"));
        setStep("resultado");
      } else {
        alert("Erro ao processar com IA. Tente novamente.");
      }
    } catch {
      alert("Erro de conexão. Verifique e tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultDataUrl) return;
    const a = document.createElement("a");
    a.href = resultDataUrl;
    a.download = `decalque-ia-${fileName.split(".")[0] || "resultado"}.png`;
    a.click();
  };

  const reset = () => {
    setStep("enviar");
    setImageEl(null);
    setImageBase64("");
    setFileName("");
    setAiDescription("");
    setResultDataUrl(null);
    setIsProcessing(false);
    setThreshold(128);
    setInvert(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/tools" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Contrast className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black uppercase tracking-tighter">Gerador de Decalque</h1>
            <span className="text-[9px] font-bold tracking-widest uppercase bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-400/20 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> Gemini 2.5
            </span>
          </div>
          <p className="text-xs text-muted-foreground">IA Gemini 2.5 Flash — transforma fotos em traçados prontos para impressão</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {(["enviar", "ajustar", "resultado"] as Step[]).map((s, i) => {
          const labels = ["1. Enviar", "2. Configurar", "3. Resultado"];
          const active = step === s;
          const done = (step === "ajustar" && s === "enviar") || (step === "resultado" && s !== "resultado");
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all",
                active ? "bg-primary text-black" : done ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
              )}>
                {done ? <CheckCircle2 className="w-3 h-3" /> : null}
                {labels[i]}
              </div>
              {i < 2 && <div className="w-6 h-px bg-white/10" />}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Upload */}
      {step === "enviar" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="glass border-2 border-dashed border-white/10 hover:border-primary/50 rounded-3xl p-16 flex flex-col items-center justify-center cursor-pointer transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-5 transition-all">
              <ImagePlus className="w-8 h-8 text-primary" />
            </div>
            <p className="font-bold text-lg mb-2">Arraste ou clique para enviar</p>
            <p className="text-muted-foreground text-sm text-center">Suporta JPG, PNG e WebP — fotos, desenhos ou referências</p>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>

          <div className="glass rounded-3xl border border-white/10 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Como funciona</h3>
            </div>
            <div className="space-y-4">
              {[
                { n: "1", t: "Envie a imagem", d: "Foto de referência, desenho ou qualquer imagem que queira virar decalque" },
                { n: "2", t: "Escolha o estilo", d: "Linhas limpas, blocos sólidos ou fine-line — cada um ideal para um tipo de trabalho" },
                { n: "3", t: "IA analisa", d: "O Gemini 2.5 Flash detecta contornos e extrai os traços com precisão profissional" },
                { n: "4", t: "Baixe o traçado", d: "PNG de alta resolução pronto para imprimir no papel de decalque" },
              ].map((item) => (
                <div key={item.n} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {item.n}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.t}</p>
                    <p className="text-xs text-muted-foreground">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Configure & Preview */}
      {step === "ajustar" && imageEl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview canvas */}
          <div className="lg:col-span-2 glass rounded-3xl border border-white/10 p-4 flex items-center justify-center overflow-hidden" style={{ minHeight: 400 }}>
            <canvas
              ref={canvasRef}
              className="rounded-2xl max-w-full max-h-[500px] object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-5">
            {/* Style selector */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <p className="text-[11px] font-bold uppercase tracking-widest">Estilo de Decalque</p>
              </div>
              <div className="space-y-2.5">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all",
                      style === s.id
                        ? "bg-primary/20 border-primary/50 text-foreground"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                    )}>
                    <p className="text-xs font-bold">{s.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-80">{s.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold preview (fast local filter) */}
            <div className="glass rounded-2xl border border-white/10 p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3">Prévia Rápida</p>
              <label className="text-xs text-muted-foreground block mb-2">Limiar: {threshold}</label>
              <input type="range" min={60} max={220} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-primary mb-4" />
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} className="rounded" />
                Inverter cores
              </label>
              <p className="text-[10px] text-muted-foreground mt-3 opacity-60">Esta prévia é rápida. O resultado final é gerado pela IA com muito mais qualidade.</p>
            </div>

            {/* Generate button */}
            <Button onClick={generateWithAI} disabled={isProcessing}
              className="w-full metallic-gradient text-black font-bold h-14 rounded-2xl text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Gemini processando...</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> Gerar com IA</>
              )}
            </Button>
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
              ← Trocar imagem
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Result */}
      {step === "resultado" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stencil preview */}
          <div className="lg:col-span-2 glass rounded-3xl border border-primary/30 p-4 flex items-center justify-center overflow-hidden bg-primary/5" style={{ minHeight: 400 }}>
            {resultDataUrl ? (
              <img src={resultDataUrl} alt="Decalque gerado" className="rounded-2xl max-w-full max-h-[500px] object-contain" />
            ) : (
              <div className="text-center text-muted-foreground">
                <Contrast className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Resultado em processamento...</p>
              </div>
            )}
          </div>

          {/* AI Description + Actions */}
          <div className="flex flex-col gap-5">
            <div className="glass rounded-2xl border border-primary/20 p-5 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Análise da IA</p>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {aiDescription || "Processando análise..."}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={downloadResult} disabled={!resultDataUrl}
                className="w-full metallic-gradient text-black font-bold h-12 rounded-2xl text-[11px] tracking-widest uppercase">
                <Download className="w-4 h-4 mr-2" /> Baixar PNG
              </Button>
              <Button variant="outline" onClick={() => { setStep("ajustar"); }}
                className="w-full h-12 rounded-2xl text-[11px] tracking-widest uppercase">
                <RefreshCw className="w-4 h-4 mr-2" /> Ajustar e Regerar
              </Button>
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                ← Nova imagem
              </button>
            </div>

            <div className="glass rounded-2xl border border-white/10 p-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground/60">Dica de impressão:</strong> Imprima em papel térmico/decalque a 100% (sem redimensionar). Para tatuagens grandes, use a ferramenta "Dividir Folhas" para A4.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
