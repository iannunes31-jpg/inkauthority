"use client";

import { useState } from "react";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, PlayCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente do Supabase
// Nota: Em produção, você deve usar @supabase/ssr ou inicializar via env variables corretamente.
// Para este painel admin isolado, estamos assumindo que NEXT_PUBLIC_SUPABASE_URL está configurado.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function NewCourseLessonPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSave = async () => {
    if (!title) {
      setMessage({ type: 'error', text: 'O título da aula é obrigatório.' });
      return;
    }
    if (!videoId) {
      setMessage({ type: 'error', text: 'Você precisa fazer o upload do vídeo primeiro.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Cria a aula no Supabase
      const { data, error } = await supabase
        .from('lessons')
        .insert([
          { 
            title: title, 
            video_url: videoId, // Salvando o UID do Cloudflare Stream no campo video_url
            // O module_id e course_id seriam associados aqui na versão final (quando houver seleção de módulo)
          }
        ]);

      if (error) {
        throw error;
      }

      setMessage({ type: 'success', text: 'Aula salva com sucesso!' });
      // Limpa o form se desejar, ou redireciona
      setTitle("");
      setVideoId(null);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erro ao salvar no banco de dados: ' + err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold mb-1">Nova Aula</h2>
          <p className="text-muted-foreground font-light">Faça upload de vídeo e publique conteúdo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold">Informações Básicas</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Título da Aula</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Módulo 1 - Introdução ao Blackwork" 
                className="bg-black/40 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Descrição (Opcional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-black/40 border border-white/10 rounded-md text-white p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Detalhes sobre o que será ensinado nesta aula..."
              ></textarea>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
             <h3 className="text-lg font-bold flex items-center gap-2">
               <PlayCircle className="w-5 h-5 text-primary" />
               Vídeo da Aula (Cloudflare Stream)
             </h3>
             
             {!videoId ? (
               <VideoUploader onSuccess={(id) => setVideoId(id)} />
             ) : (
               <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-4 flex flex-col items-center text-center">
                 <p className="text-green-400 font-bold mb-2">Vídeo pronto para publicação!</p>
                 <p className="text-sm text-muted-foreground mb-4">
                   Cloudflare Stream UID: <span className="text-white font-mono">{videoId}</span>
                 </p>
                 <Button variant="outline" size="sm" onClick={() => setVideoId(null)} className="border-white/10">
                   Substituir Vídeo
                 </Button>
               </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold">Ações</h3>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {message.text}
              </div>
            )}

            <Button 
              className="w-full bg-primary text-black font-bold hover:bg-primary/90" 
              onClick={handleSave}
              disabled={isSaving || !videoId}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar Aula"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
