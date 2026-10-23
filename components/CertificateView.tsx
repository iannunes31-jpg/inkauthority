"use client";

import { useEffect, useRef, useState } from "react";
import { Cormorant_Garamond, Montserrat, Pinyon_Script } from "next/font/google";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--cert-serif" });
const sans = Montserrat({ subsets: ["latin"], weight: ["300", "400", "600", "700", "800"], variable: "--cert-sans" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--cert-script" });

export type CertificateData = {
  code: string;
  student_name: string;
  course_title: string;
  hours: number;
  issued_at: string;
};

// A4 landscape at 96dpi: the certificate is laid out once at this size and scaled to fit.
const W = 1123;
const H = 794;

const CSS = `
.iac { width:${W}px; height:${H}px; position:relative; overflow:hidden; color:#ecedef; font-family:var(--cert-sans);
  background: radial-gradient(90% 120% at 50% 40%, #1a1b1d 0%, #0c0c0d 60%, #060607 100%);
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.iac * { box-sizing:border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.iac::before { content:''; position:absolute; inset:0; opacity:.5;
  background-image: repeating-linear-gradient(45deg, rgba(220,224,229,.035) 0 1px, transparent 1px 7px), repeating-linear-gradient(-45deg, rgba(220,224,229,.035) 0 1px, transparent 1px 7px); }
.iac .f1 { position:absolute; inset:34px; border:1.4px solid #9aa0a6; }
.iac .f2 { position:absolute; inset:47px; border:.6px solid rgba(220,224,229,.5); }
.iac .cn { position:absolute; width:98px; height:98px; }
.iac .tl { top:23px; left:23px } .iac .tr { top:23px; right:23px; transform:scaleX(-1) }
.iac .bl { bottom:23px; left:23px; transform:scaleY(-1) } .iac .br { bottom:23px; right:23px; transform:scale(-1,-1) }
.iac .ct { position:absolute; inset:76px 113px 117px; display:flex; flex-direction:column; align-items:center; text-align:center; }
.iac .logo { font-weight:800; letter-spacing:.5em; font-size:12px; color:#dfe2e6; padding-left:.5em; }
.iac .prog { font-size:8.8px; letter-spacing:.45em; color:#8f949a; margin-top:8px; text-transform:uppercase; }
.iac .sub { font-size:9.8px; letter-spacing:.6em; color:#c2c6cb; margin-top:6px; text-transform:uppercase; padding-left:.6em; }
.iac .orn { display:flex; align-items:center; gap:15px; margin:22px 0 15px; color:#9aa0a6; }
.iac .orn i { display:block; width:144px; height:1px; background:linear-gradient(90deg,transparent,#9aa0a6); }
.iac .orn i:last-child { background:linear-gradient(90deg,#9aa0a6,transparent); }
.iac .cert { font-size:10px; letter-spacing:.45em; color:#8f949a; text-transform:uppercase; padding-left:.45em; }
.iac .name { font-family:var(--cert-script); font-size:60px; color:#f1f2f4; margin-top:6px; line-height:1.2; min-width:640px; max-width:860px;
  border-bottom:1px solid rgba(160,166,172,.7); padding:0 30px 4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.iac .txt { font-size:12.8px; line-height:1.75; color:#c9ccd0; max-width:720px; margin-top:19px; font-weight:300; }
.iac .txt b { color:#eceef0; font-weight:600; }
.iac .bt { margin-top:auto; width:100%; display:grid; grid-template-columns:1fr 166px 1fr; align-items:end; gap:38px; }
.iac .sig { text-align:center; }
.iac .sig .s { font-family:var(--cert-script); font-size:27px; color:#dfe2e6; height:42px; line-height:42px; }
.iac .sig .l { border-top:1px solid rgba(220,224,229,.6); margin:4px 30px 8px; }
.iac .sig b { display:block; font-size:10px; letter-spacing:.25em; color:#ecedef; }
.iac .sig span { font-size:8.8px; letter-spacing:.2em; color:#8f949a; text-transform:uppercase; }
.iac .meta { position:absolute; bottom:58px; left:0; right:0; display:flex; justify-content:center; gap:42px; font-size:8.5px; letter-spacing:.22em; color:#7d8187; text-transform:uppercase; }
.iac .meta b { color:#c2c6cb; font-weight:600; letter-spacing:.12em; }
@media print {
  @page { size: A4 landscape; margin: 0; }
  body * { visibility: hidden !important; }
  .iac-print, .iac-print * { visibility: visible !important; }
  .iac-print { position: fixed !important; left: 0; top: 0; width: 297mm !important; height: 210mm !important; overflow: hidden; }
  .iac-print .iac-scale { transform: none !important; }
}
`;

const SILVER = (
  <>
    <stop offset="0" stopColor="#5d6268" /><stop offset=".25" stopColor="#eef0f2" /><stop offset=".5" stopColor="#9aa0a6" />
    <stop offset=".75" stopColor="#fbfbfc" /><stop offset="1" stopColor="#6b7076" />
  </>
);

function Corner({ className }: { className: string }) {
  return (
    <svg className={`cn ${className}`} viewBox="0 0 100 100" fill="none" stroke="#b3b8be" strokeWidth="1.6">
      <path d="M4 96 V20 Q4 4 20 4 H96" />
      <path d="M12 96 V26 Q12 12 26 12 H96" strokeWidth=".7" opacity=".7" />
      <path d="M4 40 Q22 40 22 22 Q40 22 40 4" strokeWidth=".9" />
      <circle cx="22" cy="22" r="3.2" fill="#b3b8be" stroke="none" />
      <path d="M30 30 l4 -8 l4 8 l-4 8 z" fill="#b3b8be" stroke="none" opacity=".9" />
    </svg>
  );
}

function Seal({ year }: { year: number }) {
  return (
    <svg viewBox="0 0 200 200" width="166" height="166" style={{ margin: "0 auto", display: "block" }}>
      <defs>
        <linearGradient id="iac-g" x1="0" y1="0" x2="1" y2="1">{SILVER}</linearGradient>
        <path id="iac-c" d="M100 100 m-68 0 a68 68 0 1 1 136 0 a68 68 0 1 1 -136 0" />
      </defs>
      <g fill="url(#iac-g)">
        {Array.from({ length: 30 }).map((_, i) => (
          <polygon key={i} points="100,2 106,14 94,14" transform={`rotate(${i * 12} 100 100)`} />
        ))}
      </g>
      <circle cx="100" cy="100" r="86" fill="#0f1011" stroke="url(#iac-g)" strokeWidth="3" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="url(#iac-g)" strokeWidth=".8" />
      <circle cx="100" cy="100" r="54" fill="none" stroke="url(#iac-g)" strokeWidth="1.2" />
      <text fontFamily="var(--cert-sans)" fontWeight="700" fontSize="9.2" fill="url(#iac-g)">
        <textPath href="#iac-c" startOffset="0" textLength="418" lengthAdjust="spacing">INK AUTHORITY ✦ STREAM CLASS ✦ CERTIFIED ✦ </textPath>
      </text>
      <text x="100" y="98" textAnchor="middle" fontSize="34" fill="url(#iac-g)">✦</text>
      <text x="100" y="122" textAnchor="middle" fontFamily="var(--cert-sans)" fontWeight="700" fontSize="9" letterSpacing="3" fill="url(#iac-g)">{year}</text>
    </svg>
  );
}

export function CertificateView({ data }: { data: CertificateData }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const issued = new Date(data.issued_at);
  const date = issued.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <div ref={boxRef} className={`iac-print w-full ${serif.variable} ${sans.variable} ${script.variable}`} style={{ height: scale ? H * scale : undefined, aspectRatio: scale ? undefined : `${W} / ${H}` }}>
      <style>{CSS}</style>
      <div className="iac-scale" style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: W, height: H, visibility: scale ? "visible" : "hidden" }}>
        <div className="iac">
          <div className="f1" /><div className="f2" />
          {["tl", "tr", "bl", "br"].map((c) => <Corner key={c} className={c} />)}
          <div className="ct">
            <div className="logo">✦ INK AUTHORITY</div>
            <div className="prog">Programa de formação para tatuadores</div>
            <svg width="756" height="83" viewBox="0 0 2000 220" style={{ marginTop: 23 }}>
              <defs><linearGradient id="iac-t" x1="0" x2="1">{SILVER}</linearGradient></defs>
              <text x="1000" y="175" textAnchor="middle" fontFamily="var(--cert-serif)" fontWeight="600" fontSize="200" letterSpacing="28" fill="url(#iac-t)">CERTIFICADO</text>
            </svg>
            <div className="sub">de conclusão</div>
            <div className="orn"><i />✦<i /></div>
            <div className="cert">Certificamos que</div>
            <div className="name">{data.student_name}</div>
            <p className="txt">
              concluiu com êxito a <b>{data.course_title}</b>, cumprindo todas as aulas, atividades práticas e a prova final de certificação com aproveitamento mínimo de 70%.
            </p>
            <div className="bt">
              <div className="sig"><div className="s">Yuri Andrade</div><div className="l" /><b>YURI ANDRADE</b><span>Fundador · Ink Authority</span></div>
              <Seal year={issued.getFullYear()} />
              <div className="sig"><div className="s">Ink Authority</div><div className="l" /><b>INK AUTHORITY</b><span>Direção pedagógica</span></div>
            </div>
          </div>
          <div className="meta">
            <span>Conclusão: <b>{date}</b></span>
            <span>Carga horária: <b>{data.hours} horas</b></span>
            <span>Certificado nº <b>{data.code}</b></span>
            <span>Verifique em <b>inkauthority.com.br/certificado/{data.code}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
