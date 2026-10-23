import Link from "next/link";
import { TermsContent } from "@/components/TermsContent";

export const metadata = { title: "Termos de Uso | Ink Authority" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Voltar</Link>
        <h1 className="text-3xl font-black mt-4 mb-8">Termos de Uso</h1>
        <TermsContent />
      </div>
    </main>
  );
}
