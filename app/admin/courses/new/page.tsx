"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSave = async () => {
    if (!title) {
      setMessage({ type: 'error', text: 'O título do curso é obrigatório.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Cria o curso no Supabase
      const { data, error } = await supabase
        .from('courses')
        .insert([
          { 
            title, 
            description,
            thumbnail_url: thumbnailUrl,
            is_published: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setMessage({ type: 'success', text: 'Curso criado com sucesso! Redirecionando...' });
      
      // Redirect to course details to add modules
      setTimeout(() => {
        router.push(`/admin/courses/${data.id}`);
      }, 1000);

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
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold mb-1">Novo Curso</h2>
          <p className="text-muted-foreground font-light">Crie o escopo do curso antes de adicionar aulas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold">Informações Básicas</h3>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Título do Curso *</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Formação Blackwork Master" 
                className="bg-black/40 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Descrição (Opcional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-black/40 border border-white/10 rounded-md text-white p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Detalhes sobre o que será ensinado neste curso..."
              ></textarea>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Capa do Curso (Opcional)
            </h3>
            <Input 
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg" 
                className="bg-black/40 border-white/10 text-white"
            />
            {thumbnailUrl && (
              <div className="mt-4 aspect-video rounded-xl border border-white/10 overflow-hidden bg-black relative">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
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
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Criando Curso..." : "Criar Curso"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
