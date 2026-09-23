"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import jsPDF from "jspdf";
import { ArrowLeft, Upload, Printer, Grid3x3, Download, FileDown, ImagePlus, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Splits one image across multiple A4 sheets so a large tattoo project can
// be printed piece by piece and taped together -- no AI involved, just
// geometry: how many A4 pages (minus their margins and a taping overlap)
// fit into the size the artist actually wants printed.
const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;
const PRINTER_MARGIN_CM = 0.5; // typical non-printable border on most printers
const MAX_PAGES = 10; // cap the whole job at 10 A4 sheets, full-size each
type Step = "enviar" | "ajustar" | "resultado";

// Finds the largest width (cm) whose resulting tile grid still fits
// within `maxPages` sheets, for a given image aspect ratio and sheet
// geometry. Used both to derive the width from a chosen page count and
// to compute the absolute cap (maxPages = MAX_PAGES).
function computeWidthForPages(aspect: number, stepW: number, stepH: number, overlapCm: number, usableW: number, usableH: number, maxPages: number) {
  const pagesFor = (widthCm: number) => {
    const heightCm = widthCm * aspect;
    const cols = Math.max(1, Math.ceil((widthCm - overlapCm) / stepW));
    const rows = Math.max(1, Math.ceil((heightCm - overlapCm) / stepH));
    return cols * rows;
  };
  // A single page's worth of width/height already fits by definition.
  let widthCm = Math.max(usableW, usableH / aspect);
  // Grow while there's still room under the cap, in 0.5cm steps -- plenty
  // of precision for a print-sizing tool, and simple/robust against the
  // ceil()-driven step function (no closed-form solution worth the risk).
  // Bounded so a degenerate aspect ratio can't spin this forever.
  for (let i = 0; i < 2000 && pagesFor(widthCm + 0.5) <= maxPages; i++) {
    widthCm += 0.5;
  }
  return Math.floor(widthCm);
}

export default function DividirFolhasPage() {
  const [step, setStep] = useState<Step>("enviar");
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [desiredPages, setDesiredPages] = useState(4);
  const [targetWidthCm, setTargetWidthCm] = useState(60);
  const [overlapMm, setOverlapMm] = useState(10);
  const [orientation, setOrientation] = useState<"retrato" | "paisagem">("retrato");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageEl(img);
      setStep("ajustar");
    };
    img.src = url;
    setFileName(file.name);
  };

  const pageW = orientation === "retrato" ? A4_WIDTH_CM : A4_HEIGHT_CM;
  const pageH = orientation === "retrato" ? A4_HEIGHT_CM : A4_WIDTH_CM;
  const usableW = pageW - 2 * PRINTER_MARGIN_CM;
  const usableH = pageH - 2 * PRINTER_MARGIN_CM;
  const overlapCm = overlapMm / 10;

  // The width is *derived* from how many sheets the person asks for --
  // "escolher a quantidade de folhas" -- rather than the other way
  // around. Recalculated whenever the page count, image, orientation or
  // overlap changes.
  useEffect(() => {
    if (!imageEl) return;
    const aspect = imageEl.height / imageEl.width;
    const stepW = Math.max(usableW - overlapCm, 1);
    const stepH = Math.max(usableH - overlapCm, 1);
    setTargetWidthCm(computeWidthForPages(aspect, stepW, stepH, overlapCm, usableW, usableH, desiredPages));
  }, [imageEl, desiredPages, usableW, usableH, overlapCm]);

  const layout = useMemo(() => {
    if (!imageEl) return null;
    const aspect = imageEl.height / imageEl.width;
    const targetHeightCm = targetWidthCm * aspect;

    // Each tile after the first needs to give back `overlapCm` of ground
    // it already covered, so the *step* between tiles is usable size minus
    // the overlap, not the full usable size.
    const stepW = Math.max(usableW - overlapCm, 1);
    const stepH = Math.max(usableH - overlapCm, 1);
    const cols = Math.max(1, Math.ceil((targetWidthCm - overlapCm) / stepW));
    const rows = Math.max(1, Math.ceil((targetHeightCm - overlapCm) / stepH));

    return { targetHeightCm, cols, rows, totalPages: cols * rows, stepW, stepH };
  }, [imageEl, targetWidthCm, usableW, usableH, overlapCm]);

  // Renders each tile onto its own canvas at print resolution (150 DPI is
  // plenty for line-art/reference sheets and keeps file sizes/browser
  // memory sane for large grids).
  const DPI = 150;
  const CM_TO_PX = DPI / 2.54;

  const tiles = useMemo(() => {
    if (!imageEl || !layout) return [];
    const { cols, rows, targetHeightCm, stepW, stepH } = layout;
    const scalePxPerCm = imageEl.width / targetWidthCm; // source px per cm of final output
    const result: { row: number; col: number; dataUrl: string; wCm: number; hCm: number }[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const startXCm = col * stepW;
        const startYCm = row * stepH;
        const tileWCm = Math.min(usableW, targetWidthCm - startXCm);
        const tileHCm = Math.min(usableH, targetHeightCm - startYCm);
        if (tileWCm <= 0 || tileHCm <= 0) continue;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(tileWCm * CM_TO_PX);
        canvas.height = Math.round(tileHCm * CM_TO_PX);
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          imageEl,
          startXCm * scalePxPerCm, startYCm * scalePxPerCm,
          tileWCm * scalePxPerCm, tileHCm * scalePxPerCm,
          0, 0, canvas.width, canvas.height
        );

        // Corner alignment ticks + page label, printed just inside the
        // overlap margin so they line up between adjacent sheets when
        // taping.
        ctx.strokeStyle = "#00000055";
        ctx.lineWidth = 1;
        const tick = 14;
        ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
        [[0, 0], [canvas.width, 0], [0, canvas.height], [canvas.width, canvas.height]].forEach(([x, y]) => {
          ctx.beginPath();
          ctx.moveTo(x - Math.sign(x - canvas.width / 2) * tick, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y - Math.sign(y - canvas.height / 2) * tick);
          ctx.stroke();
        });
        ctx.fillStyle = "#00000088";
        ctx.font = "10px monospace";
        ctx.fillText(`L${row + 1}C${col + 1}`, 6, canvas.height - 6);

        result.push({ row, col, dataUrl: canvas.toDataURL("image/png"), wCm: tileWCm, hCm: tileHCm });
      }
    }
    return result;
  }, [imageEl, layout, targetWidthCm, usableW, usableH, CM_TO_PX]);

  const handlePrint = () => window.print();

  const baseName = fileName.replace(/\.[^.]+$/, "") || "ink-authority";

  const handleDownloadTile = (t: { row: number; col: number; dataUrl: string }) => {
    const link = document.createElement("a");
    link.download = `${baseName}-L${t.row + 1}C${t.col + 1}.png`;
    link.href = t.dataUrl;
    link.click();
  };

  const handleDownloadAllPng = async () => {
    // Sequential with a short gap -- firing many downloads in the same
    // tick gets some browsers to silently block everything after the
    // first as if it were a popup spam attempt.
    for (const t of tiles) {
      handleDownloadTile(t);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  const handleDownloadPdf = () => {
    if (tiles.length === 0) return;
    const doc = new jsPDF({
      orientation: orientation === "paisagem" ? "landscape" : "portrait",
      unit: "cm",
      format: "a4",
    });
    tiles.forEach((t, i) => {
      if (i > 0) doc.addPage("a4", orientation === "paisagem" ? "landscape" : "portrait");
      doc.addImage(t.dataUrl, "PNG", PRINTER_MARGIN_CM, PRINTER_MARGIN_CM, t.wCm, t.hCm);
    });
    doc.save(`${baseName}-folhas.pdf`);
  };

  const steps: { id: Step; label: string; icon: any; enabled: boolean }[] = [
    { id: "enviar", label: "1. Enviar Imagem", icon: ImagePlus, enabled: true },
    { id: "ajustar", label: "2. Ajustar", icon: SlidersHorizontal, enabled: !!imageEl },
    { id: "resultado", label: "3. Resultado", icon: CheckCircle2, enabled: tiles.length > 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 p-6 lg:p-10">
      <div className="print:hidden">
        <Link href="/dashboard/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Ferramentas
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Dividir Folhas para Impressão</h1>
          <p className="text-muted-foreground">Divida um projeto grande em folhas A4 para imprimir e montar peça por peça.</p>
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
            <h2 className="text-xl font-bold mb-2">Envie o projeto que vai imprimir</h2>
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
                  Quantidade de folhas: {desiredPages}
                </label>
                <input
                  type="range" min={1} max={MAX_PAGES} value={desiredPages}
                  onChange={(e) => setDesiredPages(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                {layout && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Tamanho final: {targetWidthCm.toFixed(0)} × {layout.targetHeightCm.toFixed(0)} cm (proporção original mantida)
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Máximo de {MAX_PAGES} folhas A4 por projeto.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                  Sobreposição p/ colar: {overlapMm} mm
                </label>
                <input
                  type="range" min={0} max={30} value={overlapMm}
                  onChange={(e) => setOverlapMm(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Orientação da folha</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrientation("retrato")}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${orientation === "retrato" ? "bg-primary text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                  >
                    Retrato
                  </button>
                  <button
                    onClick={() => setOrientation("paisagem")}
                    className={`py-2 rounded-lg text-xs font-bold transition-colors ${orientation === "paisagem" ? "bg-primary text-black" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                  >
                    Paisagem
                  </button>
                </div>
              </div>

              {layout && (
                <div className="bg-white/5 rounded-xl p-4 text-sm">
                  <p className="font-bold flex items-center gap-2 mb-1"><Grid3x3 className="w-4 h-4 text-primary" /> {layout.totalPages} {layout.totalPages > 1 ? "folhas" : "folha"} A4</p>
                  <p className="text-xs text-muted-foreground">{layout.cols} colunas × {layout.rows} linhas</p>
                </div>
              )}

              <Button onClick={() => setStep("resultado")} disabled={tiles.length === 0} className="w-full metallic-gradient text-black font-bold gap-2 neon-glow">
                <CheckCircle2 className="w-4 h-4" /> Ver Resultado
              </Button>
            </div>

            {/* Preview em grade */}
            <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6 min-h-[400px]">
              <div
                className="grid gap-1 mx-auto bg-black/30 p-1 rounded"
                style={{
                  gridTemplateColumns: `repeat(${layout?.cols || 1}, 1fr)`,
                  maxWidth: 420,
                  aspectRatio: `${targetWidthCm} / ${layout?.targetHeightCm || 1}`,
                }}
              >
                {tiles.map((t) => (
                  <div key={`${t.row}-${t.col}`} className="relative border border-white/20 bg-white overflow-hidden">
                    <img src={t.dataUrl} alt={`Folha linha ${t.row + 1}, coluna ${t.col + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-4">
                Prévia da montagem final. Cada quadro vira uma folha A4 impressa.
              </p>
            </div>
          </div>
        )}

        {step === "resultado" && tiles.length > 0 && (
          <div className="space-y-6">
            <div className="glass rounded-2xl border border-white/10 p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <Button onClick={handleDownloadPdf} className="metallic-gradient text-black font-bold gap-2 neon-glow">
                  <FileDown className="w-4 h-4" /> Baixar Tudo em PDF
                </Button>
                <Button onClick={handleDownloadAllPng} className="bg-white/5 hover:bg-white/10 text-white font-bold gap-2">
                  <Download className="w-4 h-4" /> Baixar Cada Folha (PNG)
                </Button>
                <Button onClick={handlePrint} className="bg-white/5 hover:bg-white/10 text-white font-bold gap-2">
                  <Printer className="w-4 h-4" /> Imprimir
                </Button>
                <Button onClick={() => setStep("ajustar")} variant="ghost" className="bg-white/5 hover:bg-white/10 text-white gap-2">
                  <SlidersHorizontal className="w-4 h-4" /> Ajustar Novamente
                </Button>
              </div>

              <div
                className="grid gap-2 mx-auto"
                style={{ gridTemplateColumns: `repeat(${layout?.cols || 1}, 1fr)`, maxWidth: 560 }}
              >
                {tiles.map((t) => (
                  <div key={`${t.row}-${t.col}`} className="relative group border border-white/20 bg-white overflow-hidden rounded">
                    <img src={t.dataUrl} alt={`Folha linha ${t.row + 1}, coluna ${t.col + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleDownloadTile(t)}
                      title={`Baixar folha L${t.row + 1}C${t.col + 1}`}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold"
                    >
                      <Download className="w-4 h-4" /> L{t.row + 1}C{t.col + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área exclusiva de impressão: uma folha A4 por página, invisível na tela */}
      <div ref={printAreaRef} className="hidden print:block">
        {tiles.map((t, i) => (
          <div
            key={`${t.row}-${t.col}`}
            style={{ pageBreakAfter: i < tiles.length - 1 ? "always" : "auto" }}
            className="w-full h-full flex items-center justify-center"
          >
            <img src={t.dataUrl} alt={`Folha linha ${t.row + 1}, coluna ${t.col + 1}`} style={{ width: "100%" }} />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4 ${orientation === "paisagem" ? "landscape" : "portrait"}; margin: ${PRINTER_MARGIN_CM}cm; }
        }
      `}</style>
    </div>
  );
}
