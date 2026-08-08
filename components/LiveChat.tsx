"use client";

import { useEffect, useState, useRef } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_image_url: string;
  message: string;
  created_at: string;
}

export function LiveChat({ liveId }: { liveId: string }) {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolagem automática para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carregar mensagens e se inscrever no Realtime
  useEffect(() => {
    let channel: any;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("live_chat_messages")
        .select("*")
        .eq("live_stream_id", liveId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Inscrever no canal Realtime
    channel = supabase
      .channel(`live_chat_${liveId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_chat_messages",
          filter: `live_stream_id=eq.${liveId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [liveId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    
    try {
      const { error } = await supabase.from("live_chat_messages").insert([
        {
          live_stream_id: liveId,
          user_id: user.id,
          user_name: user.fullName || user.firstName || "Usuário",
          user_image_url: user.imageUrl,
          message: newMessage.trim(),
        },
      ]);

      if (error) throw error;
      
      setNewMessage("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glass rounded-2xl border border-white/10 flex flex-col h-[600px] lg:h-[700px]">
      <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-black/40">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-bold">Chat ao Vivo</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {messages.length} {messages.length === 1 ? "mensagem" : "mensagens"}
        </span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <MessageSquare className="w-10 h-10 mb-2" />
            <p className="text-sm">Nenhuma mensagem ainda. Seja o primeiro a dar um oi!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.user_id === user?.id ? "flex-row-reverse" : ""}`}>
              {msg.user_image_url ? (
                <img src={msg.user_image_url} alt={msg.user_name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`flex flex-col ${msg.user_id === user?.id ? "items-end" : "items-start"}`}>
                <span className="text-xs text-muted-foreground mb-1">{msg.user_name}</span>
                <div 
                  className={`px-4 py-2 rounded-2xl text-sm ${
                    msg.user_id === user?.id 
                      ? "bg-primary text-black rounded-tr-sm font-medium" 
                      : "bg-white/10 text-white rounded-tl-sm"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-white/5 bg-black/40">
        {!isLoaded ? (
          <div className="text-center text-sm text-muted-foreground py-2">Carregando...</div>
        ) : user ? (
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
              disabled={isSending}
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim() || isSending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary/20 hover:bg-primary text-primary hover:text-black rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-primary/20 disabled:hover:text-primary"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center p-3 bg-white/5 rounded-xl text-sm text-muted-foreground">
            Faça login para participar do chat
          </div>
        )}
      </div>
    </div>
  );
}
