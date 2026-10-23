"use client";

import { useRef, useState } from "react";
import { FileUp, Link2, Loader2, Plus, X, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export type Material = { name: string; url: string };

// List of a lesson's support materials: upload PDFs or add a link.
export function MaterialsEditor({ value, onChange }: { value: Material[]; onChange: (next: Material[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const upload = async (files: File[]) => {
    setError("");
    const pdfs = files.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (pdfs.length !== files.length) setError("Só arquivos PDF são aceitos.");
    if (!pdfs.length) return;
    if (pdfs.some((f) => f.size > 50 * 1024 * 1024)) return setError("Cada PDF pode ter no máximo 50 MB.");
    setUploading(true);
    try {
      const res = await fetch("/api/ai-settings/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "course-materials", files: pdfs.map(() => ({ ext: "pdf" })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Falha ao preparar o upload.");
      const added: Material[] = [];
      for (let i = 0; i < pdfs.length; i++) {
        const { path, token, publicUrl } = data.uploads[i];
        const { error: upErr } = await supabase.storage.from("assets").uploadToSignedUrl(path, token, pdfs[i], { contentType: "application/pdf" });
        if (upErr) throw upErr;
        // Default label: the file name, cleaned up ("aula2_publico_alvo.pdf" -> "Aula2 publico alvo").
        const label = pdfs[i].name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
        added.push({ name: label.charAt(0).toUpperCase() + label.slice(1), url: publicUrl });
      }
      onChange([...value, ...added]);
    } catch (err: any) {
      setError(err.message || "Não foi possível enviar o PDF.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {value.map((m, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs">
          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={m.name}
            onChange={(e) => onChange(value.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
            className="flex-1 bg-transparent font-medium focus:outline-none min-w-0"
            aria-label="Nome do material"
          />
          <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white shrink-0">abrir</a>
          <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 shrink-0" aria-label="Remover">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(e) => upload(Array.from(e.target.files ?? []))} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); upload(Array.from(e.dataTransfer.files ?? [])); }}
        disabled={uploading}
        className="w-full rounded-lg border-2 border-dashed border-white/15 hover:border-primary/60 hover:bg-white/5 transition-colors py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
        {uploading ? "Enviando PDF…" : "Enviar PDF (clique ou arraste)"}
      </button>

      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ou adicione um link: nome" className="bg-black/50 text-xs h-9" />
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="bg-black/50 text-xs h-9" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/10 shrink-0 h-9"
          aria-label="Adicionar link"
          onClick={() => {
            if (name.trim() && /^https?:\/\//.test(url.trim())) {
              onChange([...value, { name: name.trim(), url: url.trim() }]);
              setName(""); setUrl("");
            }
          }}
        >
          <Link2 className="w-3.5 h-3.5 mr-1" /><Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
