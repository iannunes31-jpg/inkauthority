"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Download, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pure canvas image processing -- no AI/ML involved. Two modes:
// "limiar" (threshold) turns the photo into flat black/white based on a
// brightness cutoff, good for flash/line-art that's already high contrast.
// "bordas" (edge detection, a classic Sobel operator) traces outlines from
// a photo, closer to what you'd want when decalcando from a photo
// reference instead of existing line art.
type Mode = "limiar" | "bordas";

export default function DecalquePage() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [mode, setMode] = useState<Mode>("limiar");
  const [threshold, setThreshold] = useState(128);
  const [edgeSensitivity, setEdgeSensitivity] = useState(80);
  const [invert, setInvert] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_DIM = 2200; // caps processing time/memory for very large photos

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setFileName(file.name);
      // Show the untouched image immediately so there's feedback before
      // the person taps "Gerar Decalque" -- otherwise the preview panel
      // would just sit blank after uploading.
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      });
    };
    img.src = url;
  };

  const process = useCallback(() => {
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

      // Grayscale buffer (luminance), used by both modes.
      const gray = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        const r = src[i * 4], g = src[i * 4 + 1], b = src[i * 4 + 2];
        gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
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
      setIsProcessing(false);
    });
  }, [imageEl, mode, threshold, edgeSensitivity, invert]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `decalque-${fileName.replace(/\.[^.]+$/, "") || "ink-authority"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6 lg:p-10">
      <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Gerador de Decalque</h1>
        <p className="text-muted-foreground">Transforme uma foto ou desenho em um traçado pronto para imprimir no papel de decalque.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controles */}
        <div className="glass p-6 rounded-2xl border border-white/10 space-y-6 h-fit">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full metallic-gradient text-black font-bold gap-2"
            >
              <Upload className="w-4 h-4" /> {imageEl ? "Trocar Imagem" : "Enviar Imagem"}
            </Button>
            {fileName && <p className="text-xs text-muted-foreground mt-2 truncate">{fileName}</p>}
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
            onClick={process}
            disabled={!imageEl || isProcessing}
            className="w-full bg-white/5 hover:bg-primary hover:text-black transition-colors font-bold gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
            {isProcessing ? "Processando..." : "Gerar Decalque"}
          </Button>

          <Button
            onClick={handleDownload}
            disabled={!imageEl}
            className="w-full metallic-gradient text-black font-bold gap-2 neon-glow"
          >
            <Download className="w-4 h-4" /> Baixar PNG
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-4 flex items-center justify-center min-h-[400px] bg-black/30">
          {imageEl ? (
            <canvas ref={canvasRef} className="max-w-full max-h-[70vh] rounded-lg" style={{ imageRendering: "pixelated" }} />
          ) : (
            <div className="text-center text-muted-foreground">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Envie uma imagem para começar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
