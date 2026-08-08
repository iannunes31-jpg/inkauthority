"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ImagePlus, MessageSquare, Heart, Send, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CommunityPage() {
  const { user } = useUser();
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // States for editing
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Buscar posts do Supabase
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar posts:", error);
    } else {
      setPosts(data || []);
    }
    setIsLoading(false);
  };

  const handlePublish = async () => {
    if (!postText.trim() || !user) return;
    setIsPublishing(true);

    const newPost = {
      clerk_user_id: user.id,
      user_name: user.fullName || user.username || "Usuário",
      user_avatar: user.imageUrl,
      content: postText.trim(),
      user_role: "Aluno",
    };

    const { error } = await supabase.from("posts").insert([newPost]);
    
    if (error) {
      console.error("Erro completo ao publicar:", error);
      alert(`Erro do banco de dados: ${error.message}\n\nIsso pode ser porque o seu usuário ainda não foi sincronizado pelo Webhook. Altere seu nome no Clerk e tente novamente!`);
    } else {
      setPostText("");
      fetchPosts(); // Recarrega os posts
    }
    
    setIsPublishing(false);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Tem certeza que deseja apagar esta publicação?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);
    
    if (error) {
      alert("Erro ao deletar: " + error.message);
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const startEditing = (post: any) => {
    setEditingPostId(post.id);
    setEditingText(post.content);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditingText("");
  };

  const saveEdit = async (postId: string) => {
    if (!editingText.trim()) return;
    setIsSavingEdit(true);

    const { error } = await supabase
      .from("posts")
      .update({ content: editingText.trim() })
      .eq("id", postId);

    if (error) {
      alert("Erro ao editar: " + error.message);
    } else {
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, content: editingText.trim() } : p));
      setEditingPostId(null);
      setEditingText("");
    }
    setIsSavingEdit(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Comunidade Authority</h1>
        <p className="text-muted-foreground">Compartilhe resultados, tire dúvidas e faça networking com outros artistas.</p>
      </div>

      {/* Caixa de Nova Publicação */}
      <div className="glass p-4 rounded-2xl border border-white/5 mb-8 relative">
        {!user && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl">
            <span className="text-sm font-bold text-white">Faça login para publicar</span>
          </div>
        )}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden flex-shrink-0">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Seu Perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/10" />
            )}
          </div>
          <div className="flex-1">
            <textarea 
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Compartilhe um resultado ou faça uma pergunta..."
              className="w-full bg-transparent resize-none border-none focus:ring-0 text-sm placeholder:text-muted-foreground min-h-[80px]"
            />
            
            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
              <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <ImagePlus className="w-4 h-4" />
                <span>Adicionar Foto</span>
              </button>
              
              <Button 
                disabled={!postText.trim() || isPublishing}
                onClick={handlePublish}
                className="metallic-gradient text-black font-bold h-8 px-4 rounded-full text-xs"
              >
                <Send className="w-3 h-3 mr-2" />
                {isPublishing ? "Enviando..." : "Publicar"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed de Publicações */}
      {isLoading ? (
        <div className="text-center text-white/50 text-sm py-10 animate-pulse">Carregando feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-white/50 text-sm py-10 glass rounded-2xl border border-white/5">Nenhuma publicação ainda. Seja o primeiro a postar!</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-5 rounded-2xl border border-white/5"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={post.user_avatar || "https://i.pravatar.cc/150"} alt={post.user_name} className="w-10 h-10 rounded-full object-cover bg-white/10" />
                  <div>
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      {post.user_name}
                      <span className="text-[9px] uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded text-white/70">
                        {post.user_role}
                      </span>
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Dropdown Menu para Editar/Apagar se for o dono do post */}
                {user?.id === post.clerk_user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-md">
                      <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10" onClick={() => startEditing(post)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Editar Publicação
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-500 hover:bg-red-500/20 focus:bg-red-500/20 focus:text-red-500" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Apagar Publicação
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Post Content / Edit Mode */}
              {editingPostId === post.id ? (
                <div className="mb-4">
                  <textarea 
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={cancelEditing} className="text-muted-foreground hover:text-white">
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={() => saveEdit(post.id)} disabled={isSavingEdit || !editingText.trim()} className="bg-primary text-black hover:bg-primary/80 font-bold">
                      {isSavingEdit ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/90 mb-4 whitespace-pre-wrap">{post.content}</p>
              )}

              {/* Imagem da Postagem (se houver) */}
              {post.image_url && (
                <div className="mb-4 rounded-xl overflow-hidden bg-black/50 aspect-video relative">
                  <Image 
                    src={post.image_url} 
                    alt="Postagem" 
                    fill 
                    className="object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 border-t border-white/5 pt-4 mt-2">
                <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-red-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes_count} Curtidas</span>
                </button>
                <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments_count} Comentários</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
