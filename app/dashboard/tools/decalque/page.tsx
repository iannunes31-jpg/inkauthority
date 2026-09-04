"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, RefreshCw, Layers, ImagePlus, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Pure canvas image processing -- no AI/ML involved. Two modes:
// "limiar" (threshold) turns the photo into flat black/white based on a
// brightness cutoff, good for flash/line-art that's already high contrast.
// "bordas" (edge detection, a classic Sobel operator) traces outlines from
// a photo, closer to what you'd want when decalcando from a photo
// reference instead of existing line art.
type Mode = "limiar" | "bordas";
type Step = "enviar" | "ajustar" | "resultado";

export default function DecalquePage() {
  const [step, setStep] = useState<Step>("enviar");
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<Mode>("limiar");
  const [threshold, setThreshold] = useState(128);
  const [edgeSensitivity, setEdgeSensitivity] = useState(80);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [invert, setInvert] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_DIM = 2200; // caps processing time/memory for very large photos

  // The "ajustar" step's <canvas> only exists while that step is active
  // (it's conditionally rendered), so it needs to be redrawn from
  // scratch every time we land back on this step -- e.g. coming back
  // via "Ajustar Novamente" after already generating a result once.
  useEffect(() => {
    if (step !== "ajustar" || !imageEl) return;
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = Math.min(1, MAX_DIM / Math.max(imageEl.width, imageEl.height));
      canvas.width = Math.round(imageEl.width * scale);
      canvas.height = Math.round(imageEl.height * scale);
      const ctx = canvas.getContext("2d")!;
      if (resultDataUrl) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = resultDataUrl;
      } else {
        ctx.drawImage(imageEl, 0, 0, canvas.width, canvas.height);
      }
    });
  }, [step, imageEl, resultDataUrl]);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setFileName(file.name);
      setHasResult(false);
      setResultDataUrl(null); // a fresh upload discards any previous result
      setStep("ajustar");
    };
    img.src = url;
  };

  const process = useCallback((goToResult = false) => {
    if (!imageEl || !canvasRef.current) return;
    setIsProcessing(true);

    // Let the "Processando..." state actually paint before the (synchronous,
    // potentially heavy) pixel loop blocks the main thread.
    requestAnimationFrame(() => {
      const canvas = canvasRef.current!;
      const scale = Math.min(1, MAX_DIM / Math.max(imageEl.width, imageEl.height));
      const w = Math.round(imageEl.width * scale);
      const h = Math.round(imageEl.height * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(imageEl, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const src = imageData.data;

      // Grayscale buffer (luminance), used by both modes -- with brightness
      ///contrast pre-adjustment so a washed-out or over-dark source photo
      // can be tuned before thresholding/edge detection instead of just
      // accepting whatever the camera captured.
      const contrastFactor = (259 * (contrast * 2.55 + 255)) / (255 * (259 - contrast * 2.55));
      const gray = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        const r = src[i * 4], g = src[i * 4 + 1], b = src[i * 4 + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const adjusted = contrastFactor * (lum - 128) + 128 + brightness;
        gray[i] = Math.min(255, Math.max(0, adjusted));
      }

      const out = new Uint8ClampedArray(w * h);

      if (mode === "limiar") {
        for (let i = 0; i < w * h; i++) {
          out[i] = gray[i] < threshold ? 0 : 255;
        }
      } else {
        // Sobel edge detection: gradient magnitude above a sensitivity
        // cutoff becomes a black line, everything else stays white.
        const gxKernel = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const gyKernel = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        const cutoff = (100 - edgeSensitivity) * 4; // higher sensitivity -> lower cutoff -> more lines
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            let gx = 0, gy = 0, k = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const v = gray[(y + ky) * w + (x + kx)];
                gx += v * gxKernel[k];
                gy += v * gyKernel[k];
                k++;
              }
            }
            const mag = Math.sqrt(gx * gx + gy * gy);
            out[y * w + x] = mag > cutoff ? 0 : 255;
          }
        }
      }

      for (let i = 0; i < w * h; i++) {
        const v = invert ? 255 - out[i] : out[i];
        src[i * 4] = v;
        src[i * 4 + 1] = v;
        src[i * 4 + 2] = v;
        src[i * 4 + 3] = 255;
      }

      ctx.putImageData(imageData, 0, 0);
      // Capture the result as a data URL right away -- the canvas element
      // itself gets unmounted when we switch to the "resultado" step (it
      // only exists in the "ajustar" step's JSX), so anything reading
      // canvasRef.current later would find it empty/gone.
      const dataUrl = canvas.toDataURL("image/png");
      setResultDataUrl(dataUrl);
      setIsProcessing(false);
      setHasResult(true);
      if (goToResult) setStep("resultado");
    });
  }, [imageEl, mode, threshold, edgeSensitivity, brightness, contrast, invert]);

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const link = document.createElement("a");
    link.download = `decalque-${fileName.replace(/\.[^.]+$/, "") || "ink-authority"}.png`;
    link.href = resultDataUrl;
    link.click();
  };

  const steps: { id: Step; label: string; icon: any; enabled: boolean }[] = [
    { id: "enviar", label: "1. Enviar Imagem", icon: ImagePlus, enabled: true },
    { id: "ajustar", label: "2. Ajustar", icon: SlidersHorizontal, enabled: !!imageEl },
    { id: "resultado", label: "3. Resultado", icon: CheckCircle2, enabled: hasResult },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6 lg:p-10">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Gerador de Decalque</h1>
        <p className="text-muted-foreground">Transforme uma foto ou desenho em um traçado pronto para imprimir no papel de decalque.</p>
      </div>

      {/* Passos (aba interativa) */}
      <div className="flex items-center gap-2 mb-8 bg-black/40 p-1.5 rounded-xl border border-white/5 w-fit flex-wrap">
        {steps.map((s) => (
          <button
            key={s.id}
            onClick={() => s.enabled && setStep(s.id)}
            disabled={!s.enabled}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
              step === s.id ? "bg-white/10 text-white" : s.enabled ? "text-white/50 hover:text-white hover:bg-white/5" : "text-white/20 cursor-not-allowed"
            )}
          >
            <s.icon className="w-4 h-4" /> {s.label}
          </button>
        ))}
      </div>

      {step === "enviar" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="glass border-2 border-dashed border-white/15 hover:border-primary/50 rounded-3xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[360px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 text-primary">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Envie uma foto ou desenho</h2>
          <p className="text-sm text-muted-foreground max-w-sm">Clique aqui para escolher uma imagem do seu computador ou celular.</p>
        </div>
      )}

      {step === "ajustar" && imageEl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controles */}
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-6 h-fit">
            <div>
              <Button onClick={() => fileInputRef.current?.click()} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold gap-2">
                <Upload className="w-4 h-4" /> Trocar Imagem
              </Button>
              {fileName && <p className="text-xs text-muted-foreground mt-2 truncate">{fileName}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Brilho: {brightness > 0 ? `+${brightness}` : brightness}
              </label>
              <input
                type="range" min={-100} max={100} value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Contraste: {contrast > 0 ? `+${contrast}` : contrast}
              </label>
              <input
                type="range" min={-100} max={100} value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Modo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("limiar")}
                  className={`py-2 rounded-lg text-xs font-bold transition-colors ${mode === "limiar" ? "bg-primary text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  Contraste
                </button>
                <button
                  onClick={() => setMode("bordas")}
                  className={`py-2 rounded-lg text-xs font-bold transition-colors ${mode === "bordas" ? "bg-primary text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                >
                  Detectar Bordas
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                {mode === "limiar"
                  ? "Ideal para desenhos e flashes que já têm bom contraste."
                  : "Ideal para extrair o contorno de uma foto de referência."}
              </p>
            </div>

            {mode === "limiar" ? (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Sensibilidade do traço: {threshold}
                </label>
                <input
                  type="range" min={0} max={255} value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Detalhe do contorno: {edgeSensitivity}%
                </label>
                <input
                  type="range" min={10} max={100} value={edgeSensitivity}
                  onChange={(e) => setEdgeSensitivity(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={invert} onChange={(e) => setInvert(e.target.checked)} className="accent-primary w-4 h-4" />
              Inverter (linha branca em fundo preto)
            </label>

            <Button
              onClick={() => process(true)}
              disabled={isProcessing}
              className="w-full metallic-gradient text-black font-bold gap-2 neon-glow"
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
              {isProcessing ? "Processando..." : "Gerar Decalque"}
            </Button>
          </div>

          {/* Preview ao vivo */}
          <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-4 flex items-center justify-center min-h-[400px] bg-black/30">
            <canvas ref={canvasRef} className="max-w-full max-h-[70vh] rounded-lg" style={{ imageRendering: "pixelated" }} />
          </div>
        </div>
      )}

      {step === "resultado" && resultDataUrl && (
        <div className="glass rounded-2xl border border-white/10 p-6 flex flex-col items-center gap-6">
          <img
            src={resultDataUrl}
            alt="Decalque gerado"
            className="max-w-full max-h-[65vh] rounded-lg border border-white/10 bg-white"
          />
          <div className="flex flex-wrap gap-3 w-full max-w-md">
            <Button onClick={handleDownload} className="flex-1 metallic-gradient text-black font-bold gap-2 neon-glow">
              <Download className="w-4 h-4" /> Baixar PNG
            </Button>
            <Button onClick={() => setStep("ajustar")} variant="ghost" className="flex-1 bg-white/5 hover:bg-white/10 text-white gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Ajustar Novamente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
