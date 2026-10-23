import Link from "next/link";
import { ShieldCheck, ShieldX } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CERT_FIELDS } from "@/lib/certificates";
import { CertificateView } from "@/components/CertificateView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verificação de certificado | Ink Authority" };

// Public page so anyone (a client, an employer) can confirm a certificate is real.
export default async function VerifyCertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = decodeURIComponent(code).toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20);
  const { data } = await supabaseAdmin.from("certificates").select(CERT_FIELDS).eq("code", clean).maybeSingle();

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Ink Authority</Link>
        {data ? (
          <>
            <div className="flex items-center gap-3 mt-6 mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/5">
              <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-bold">Certificado válido</p>
                <p className="text-sm text-muted-foreground">
                  Emitido pela Ink Authority para <b className="text-foreground">{data.student_name}</b> em{" "}
                  {new Date(data.issued_at).toLocaleDateString("pt-BR")} · nº {data.code}
                </p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <CertificateView data={data} />
            </div>
          </>
        ) : (
          <div className="mt-16 text-center">
            <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">Certificado não encontrado</h1>
            <p className="text-muted-foreground">Confira o código ({clean || "vazio"}) e tente de novo.</p>
          </div>
        )}
      </div>
    </main>
  );
}
