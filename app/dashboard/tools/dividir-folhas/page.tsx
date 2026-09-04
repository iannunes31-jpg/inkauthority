"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Printer, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Splits one image across multiple A4 sheets so a large tattoo project can
// be printed piece by piece and taped together -- no AI involved, just
// geometry: how many A4 pages (minus their margins and a taping overlap)
// fit into the size the artist actually wants printed.
const A4_WIDTH_CM = 21;
const A4_HEIGHT_CM = 29.7;
const PRINTER_MARGIN_CM = 0.5; // typical non-printable border on most printers
const MAX_PAGES = 10; // cap the whole job at 10 A4 sheets, full-size each

function computeMaxWidthCm(aspect: number, stepW: number, stepH: number, overlapCm: number, usableW: number, usableH: number) {
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
  for (let i = 0; i < 2000 && pagesFor(widthCm + 0.5) <= MAX_PAGES; i++) {
    widthCm += 0.5;
  }
  return Math.floor(widthCm);
}

export default function DividirFolhasPage() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [targetWidthCm, setTargetWidthCm] = useState(60);
  const [overlapMm, setOverlapMm] = useState(10);
  const [orientation, setOrientation] = useState<"retrato" | "paisagem">("retrato");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImageEl(img);
    img.src = url;
    setFileName(file.name);
  };

  const pageW = orientation === "retrato" ? A4_WIDTH_CM : A4_HEIGHT_CM;
  const pageH = orientation === "retrato" ? A4_HEIGHT_CM : A4_WIDTH_CM;
  const usableW = pageW - 2 * PRINTER_MARGIN_CM;
  const usableH = pageH - 2 * PRINTER_MARGIN_CM;
  const overlapCm = overlapMm / 10;

  // Never let the job grow past MAX_PAGES full-size A4 sheets -- the cap
  // depends on the image's own aspect ratio plus orientation/overlap, so
  // it's recalculated whenever any of those change.
  const maxWidthCm = useMemo(() => {
    if (!imageEl) return 200;
    const aspect = imageEl.height / imageEl.width;
    const stepW = Math.max(usableW - overlapCm, 1);
    const stepH = Math.max(usableH - overlapCm, 1);
    return computeMaxWidthCm(aspect, stepW, stepH, overlapCm, usableW, usableH);
  }, [imageEl, usableW, usableH, overlapCm]);

  useEffect(() => {
    if (targetWidthCm > maxWidthCm) setTargetWidthCm(maxWidthCm);
  }, [maxWidthCm, targetWidthCm]);

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
    const result: { row: number; col: number; dataUrl: string }[] = [];

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

        result.push({ row, col, dataUrl: canvas.toDataURL("image/png") });
      }
    }
    return result;
  }, [imageEl, layout, targetWidthCm, usableW, usableH, CM_TO_PX]);

  const handlePrint = () => window.print();

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
              <Button onClick={() => fileInputRef.current?.click()} className="w-full metallic-gradient text-black font-bold gap-2">
                <Upload className="w-4 h-4" /> {imageEl ? "Trocar Imagem" : "Enviar Imagem"}
              </Button>
              {fileName && <p className="text-xs text-muted-foreground mt-2 truncate">{fileName}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
                Largura final desejada: {targetWidthCm} cm
              </label>
              <input
                type="range" min={10} max={maxWidthCm} value={targetWidthCm}
                onChange={(e) => setTargetWidthCm(Number(e.target.value))}
                className="w-full accent-primary"
              />
              {layout && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Altura final: {layout.targetHeightCm.toFixed(1)} cm (proporção original mantida)
                </p>
              )}
              {imageEl && (
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  Máximo de {MAX_PAGES} folhas A4 por projeto (até {maxWidthCm} cm de largura nessa orientação).
                </p>
              )}
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
                <p className="font-bold flex items-center gap-2 mb-1"><Grid3x3 className="w-4 h-4 text-primary" /> {layout.totalPages} folha{layout.totalPages > 1 ? "s" : ""} A4</p>
                <p className="text-xs text-muted-foreground">{layout.cols} colunas × {layout.rows} linhas</p>
              </div>
            )}

            <Button onClick={handlePrint} disabled={!imageEl} className="w-full metallic-gradient text-black font-bold gap-2 neon-glow">
              <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
            </Button>
          </div>

          {/* Preview em grade */}
          <div className="lg:col-span-2 glass rounded-2xl border border-white/10 p-6 min-h-[400px]">
            {!imageEl ? (
              <div className="h-full flex items-center justify-center text-center text-muted-foreground min-h-[350px]">
                <div>
                  <Grid3x3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Envie uma imagem para calcular as folhas</p>
                </div>
              </div>
            ) : (
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
            )}
            <p className="text-[11px] text-muted-foreground text-center mt-4">
              Prévia da montagem final. Cada quadro vira uma folha A4 impressa.
            </p>
          </div>
        </div>
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
