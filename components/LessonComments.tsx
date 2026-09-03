"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MessageCircle, Send, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LessonCommentsProps {
  lessonId: string;
}

// Q&A / doubts thread for a single lesson. Mirrors the Community post feed
// pattern (components/community/page.tsx) but scoped to one lesson via
// lesson_id, using the dedicated `lesson_comments` table (see
// supabase-lesson-comments-migration.sql -- has to be applied manually,
// there's no automated DB migration path available here).
export function LessonComments({ lessonId }: LessonCommentsProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (lessonId) fetchComments();
  }, [lessonId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lesson_comments")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: true });

      if (error) {
        // The migration may not have been applied yet -- fail quietly
        // instead of showing a broken error state for a not-yet-existing
        // table.
        console.error("Erro ao buscar dúvidas/comentários:", error);
        setComments([]);
      } else {
        setComments(data || []);
      }
    } catch (err) {
      console.error("Erro ao buscar dúvidas/comentários:", err);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!user || !commentText.trim()) return;
    setIsPublishing(true);

    const newComment = {
      lesson_id: lessonId,
      clerk_user_id: user.id,
      user_name: user.fullName || user.username || "Usuário",
      user_avatar: user.imageUrl,
      content: commentText.trim(),
    };

    const { error } = await supabase.from("lesson_comments").insert([newComment]);

    if (error) {
      alert(`Erro ao publicar: ${error.message}`);
    } else {
      setCommentText("");
      fetchComments();
    }
    setIsPublishing(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Tem certeza que deseja apagar este comentário?")) return;
    const { error } = await supabase.from("lesson_comments").delete().eq("id", commentId);
    if (error) {
      alert("Erro ao deletar: " + error.message);
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const startEditing = (comment: any) => {
    setEditingId(comment.id);
    setEditingText(comment.content);
  };

  const saveEdit = async (commentId: string) => {
    if (!editingText.trim()) return;
    setIsSavingEdit(true);
    const { error } = await supabase
      .from("lesson_comments")
      .update({ content: editingText.trim() })
      .eq("id", commentId);

    if (error) {
      alert("Erro ao editar: " + error.message);
    } else {
      setComments((prev) => prev.map((c) => c.id === commentId ? { ...c, content: editingText.trim() } : c));
      setEditingId(null);
      setEditingText("");
    }
    setIsSavingEdit(false);
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/10">
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Dúvidas e Comentários</h2>
        {comments.length > 0 && (
          <span className="text-xs text-muted-foreground">({comments.length})</span>
        )}
      </div>

      {/* Nova pergunta/comentário */}
      <div className="flex gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt="Você" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10" />
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={user ? "Deixe sua dúvida ou comentário sobre esta aula..." : "Faça login para comentar"}
            disabled={!user}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm resize-none min-h-[70px] focus:outline-none focus:border-primary/50 disabled:opacity-50"
          />
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              disabled={!user || !commentText.trim() || isPublishing}
              onClick={handlePublish}
              className="metallic-gradient text-black font-bold h-8 px-4 rounded-full text-xs neon-glow"
            >
              <Send className="w-3 h-3 mr-2" />
              {isPublishing ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de comentários */}
      {isLoading ? (
        <div className="text-center text-white/50 text-sm py-8 animate-pulse">Carregando comentários...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-white/50 text-sm py-8 border-t border-white/5">
          Nenhuma dúvida ainda. Seja o primeiro a perguntar!
        </div>
      ) : (
        <div className="space-y-4 border-t border-white/5 pt-5">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <img
                src={comment.user_avatar || "https://i.pravatar.cc/150"}
                alt={comment.user_name}
                className="w-9 h-9 rounded-full object-cover bg-white/10 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{comment.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {user?.id === comment.clerk_user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-md">
                        <DropdownMenuItem className="cursor-pointer hover:bg-white/10 focus:bg-white/10" onClick={() => startEditing(comment)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-red-500 hover:bg-red-500/20 focus:bg-red-500/20 focus:text-red-500" onClick={() => handleDelete(comment.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Apagar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {editingId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 min-h-[70px]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-white h-7 text-xs">
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => saveEdit(comment.id)} disabled={isSavingEdit || !editingText.trim()} className="bg-primary text-black hover:bg-primary/80 font-bold h-7 text-xs">
                        {isSavingEdit ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/85 mt-1 whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
