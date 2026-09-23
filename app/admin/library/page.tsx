"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Brush, FileCode, UploadCloud, Trash2, Library, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLibrary() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Procreate"); // Default
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = ["Contratos", "Procreate", "Marketing", "Planilhas", "Outros"];

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('library_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error("Erro ao carregar materiais:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string) => {
    if (type === 'PDF' || type === 'DOCX') return <FileText className="w-5 h-5 text-primary" />;
    if (type === 'BRUSH' || type === 'IMAGE') return <Brush className="w-5 h-5 text-primary" />;
    return <FileCode className="w-5 h-5 text-primary" />;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!title || !file) {
      alert("Preencha o título e selecione um arquivo.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Determina o tipo de arquivo
      const ext = file.name.split('.').pop()?.toUpperCase() || 'ARQUIVO';
      let resourceType = ext;
      if (['BRUSH', 'BRUSHSET'].includes(ext)) resourceType = 'BRUSH';
      else if (['XLS', 'XLSX'].includes(ext)) resourceType = 'XLSX';
      else if (['DOC', 'DOCX'].includes(ext)) resourceType = 'DOCX';
      else if (['PNG', 'JPG', 'JPEG'].includes(ext)) resourceType = 'IMAGE';

      // Formata o tamanho do arquivo
      const sizeMB = file.size / (1024 * 1024);
      const sizeStr = sizeMB < 1 ? `${Math.round(file.size / 1024)} KB` : `${sizeMB.toFixed(1)} MB`;

      // 2. Faz o upload para o Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `materials/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('library_files')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Pegar a URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('library_files')
        .getPublicUrl(filePath);

      // 3. Salva no banco de dados (admin-gated no servidor)
      const res = await fetch('/api/admin/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          resource_type: resourceType,
          file_url: publicUrl,
          file_size: sizeStr,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);

      // Reseta e atualiza
      setTitle("");
      setFile(null);
      setIsUploadModalOpen(false);
      fetchResources();
    } catch (err: any) {
      console.error(err);
      alert("Erro ao fazer upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Tem certeza que deseja apagar este material?")) return;
    try {
      const res = await fetch(`/api/admin/library?id=${id}&fileUrl=${encodeURIComponent(fileUrl)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error((await res.json()).error);

      fetchResources();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Biblioteca Pro</h2>
          <p className="text-muted-foreground font-light">Faça upload de materiais para seus alunos baixarem.</p>
        </div>
        <Button 
           className="metallic-gradient text-black font-bold"
           onClick={() => setIsUploadModalOpen(true)}
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Novo Material
        </Button>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Material</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Categoria</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground">Tamanho</th>
                <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground animate-pulse">Carregando...</td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
                    <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum material cadastrado ainda.</p>
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                          {getIconForType(res.resource_type)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{res.title}</div>
                          <div className="text-xs text-muted-foreground uppercase">{res.resource_type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-muted-foreground">{res.category}</td>
                    <td className="py-4 text-sm text-muted-foreground">{res.file_size}</td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() => handleDelete(res.id, res.file_url)}
                        className="p-2 hover:bg-destructive/20 rounded-lg text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
            <button 
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-primary" /> Upload de Material
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Título</label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Pack de Brushes" 
                  className="bg-black/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Categoria</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:border-primary"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Arquivo</label>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
              <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>Cancelar</Button>
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || !title || !file}
                className="metallic-gradient text-black font-bold"
              >
                {isUploading ? "Enviando..." : "Salvar Material"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
