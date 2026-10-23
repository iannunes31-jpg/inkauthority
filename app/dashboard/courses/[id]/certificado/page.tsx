"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, Download, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateView, type CertificateData } from "@/components/CertificateView";

type State = {
  certificate: CertificateData | null;
  eligible?: boolean;
  isAdmin?: boolean;
  suggestedName?: string;
  courseTitle?: string;
  hours?: number;
  error?: string;
};

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State | null>(null);
  const [name, setName] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/certificates/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: State) => {
        setState(d);
        setName(d.suggestedName ?? "");
      })
      .catch(() => setState({ certificate: null, error: "Não foi possível carregar o certificado." }));
  }, [id]);

  const issue = async () => {
    setError("");
    setIssuing(true);
    const res = await fetch(`/api/certificates/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => null);
    const body = await res?.json().catch(() => ({}));
    setIssuing(false);
    if (!res?.ok) return setError(body?.error || "Não foi possível emitir o certificado.");
    setState({ certificate: body.certificate });
  };

  // Renders the certificate (at its full A4 size) into an image and saves it as a real PDF file.
  const [downloading, setDownloading] = useState(false);
  const downloadPdf = async () => {
    const node = document.querySelector<HTMLElement>(".iac");
    if (!node || !state?.certificate) return;
    setDownloading(true);
    try {
      const [{ toJpeg }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
      await document.fonts.ready;
      const image = await toJpeg(node, { quality: 0.95, pixelRatio: 3, width: 1123, height: 794, cacheBust: true });
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(image, "JPEG", 0, 0, 297, 210);
      pdf.save(`certificado-ink-authority-${state.certificate.code}.pdf`);
    } catch (err) {
      console.error("[certificado] pdf", err);
      alert("Não foi possível gerar o PDF. Tente de novo.");
    } finally {
      setDownloading(false);
    }
  };

  const back = (
    <Link href={`/dashboard/courses/${id}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
      <ArrowLeft className="w-4 h-4" /> Voltar para o curso
    </Link>
  );

  if (!state) return <div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  if (state.certificate) {
    return (
      <div className="max-w-6xl mx-auto p-6 lg:p-10">
        {back}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Award className="w-6 h-6 text-primary" /> Seu certificado</h1>
            <p className="text-sm text-muted-foreground mt-1">Parabéns pela conquista! Baixe em PDF e compartilhe nas suas redes.</p>
          </div>
          <Button onClick={downloadPdf} disabled={downloading} className="metallic-gradient text-black font-bold">
            {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {downloading ? "Gerando PDF..." : "Baixar PDF"}
          </Button>
        </div>
        <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10">
          <CertificateView data={state.certificate} />
        </div>
        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Qualquer pessoa pode confirmar a autenticidade em{" "}
          <Link href={`/certificado/${state.certificate.code}`} target="_blank" className="underline">inkauthority.com.br/certificado/{state.certificate.code}</Link>
        </p>      </div>
    );
  }

  if (state.error || !state.eligible) {
    return (
      <div className="max-w-3xl mx-auto p-6 lg:p-10">
        {back}
        <div className="glass p-10 rounded-2xl border border-white/10 text-center">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Certificado bloqueado</h1>
          <p className="text-muted-foreground mb-6">{state.error || "O certificado é liberado assim que você for aprovado na prova final do curso."}</p>
          {!state.error && (
            <Link href={`/dashboard/courses/${id}/prova`}><Button className="metallic-gradient text-black font-bold">Ir para a prova final</Button></Link>
          )}
        </div>
        {state.isAdmin && state.courseTitle && (
          <div className="mt-10">
            <p className="text-xs text-yellow-500 mb-3">Prévia de administrador (exemplo, não é salvo):</p>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <CertificateView data={{ code: "IA-EXEMPLO1", student_name: "Nome do Aluno", course_title: state.courseTitle, hours: state.hours ?? 10, issued_at: new Date().toISOString() }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 lg:p-10">
      {back}
      <div className="glass p-8 rounded-2xl border border-primary/30">
        <Award className="w-10 h-10 text-primary mb-4" />
        <h1 className="text-2xl font-black mb-2">Você foi aprovado! 🎉</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Confira como seu nome vai aparecer no certificado de <b className="text-foreground">{state.courseTitle}</b>.
        </p>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">Nome completo</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="Seu nome e sobrenome"
          className="w-full bg-black/40 border border-white/10 rounded-lg py-3 px-4 text-base focus:outline-none focus:border-primary/60"
        />
        <p className="text-xs text-yellow-500/90 mt-2">Atenção: depois de emitido, o nome não pode ser alterado.</p>
        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
        <Button onClick={issue} disabled={issuing || name.trim().split(/\s+/).length < 2} className="w-full mt-6 metallic-gradient text-black font-bold h-12">
          {issuing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Award className="w-4 h-4 mr-2" />} Emitir meu certificado
        </Button>
      </div>
    </div>
  );
}
