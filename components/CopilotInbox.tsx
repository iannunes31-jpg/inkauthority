"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2, CheckCircle2, Edit3, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface Message {
  role: string;
  content: string;
  created_at: string;
}

interface Conversation {
  phone_number: string;
  last_message: string;
  last_time: string;
  has_pending: boolean;
  messages: Message[];
}

function formatPhone(jid: string) {
  const number = jid.split("@")[0];
  if (number.startsWith("55") && number.length >= 12) {
    const br = number.slice(2);
    const ddd = br.slice(0, 2);
    const rest = br.slice(2);
    const mid = rest.length === 9 ? rest.slice(0, 5) : rest.slice(0, 4);
    const end = rest.length === 9 ? rest.slice(5) : rest.slice(4);
    return `+55 (${ddd}) ${mid}-${end}`;
  }
  return "+" + number;
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function CopilotInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [editedSuggestion, setEditedSuggestion] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch("/api/whatsapp/conversations");
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
        if (selected) {
          const updated = data.find((c) => c.phone_number === selected.phone_number);
          if (updated) {
            setSelected(updated);
            const copilot = updated.messages.find((m) => m.role === "copilot");
            if (copilot && editedSuggestion === "") setEditedSuggestion(copilot.content);
          }
        }
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => fetchConversations(true), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  const handleSelect = (conv: Conversation) => {
    setSelected(conv);
    const copilot = conv.messages.find((m) => m.role === "copilot");
    setEditedSuggestion(copilot?.content || "");
  };

  const handleSend = async () => {
    if (!selected || !editedSuggestion.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/whatsapp/send-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: selected.phone_number, message: editedSuggestion }),
      });
      if (res.ok) {
        setEditedSuggestion("");
        await fetchConversations();
      } else {
        alert("Erro ao enviar mensagem. Verifique se o WhatsApp está conectado.");
      }
    } catch {
      alert("Erro de conexão ao enviar mensagem.");
    }
    setSending(false);
  };

  const pendingCount = conversations.filter((c) => c.has_pending).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[580px]">
      {/* Left: conversation list */}
      <div className="w-72 flex-shrink-0 glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">Conversas</h3>
            {pendingCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchConversations()}
            disabled={refreshing}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>Nenhuma conversa ainda.</p>
              <p className="text-[11px] mt-1 opacity-60">As mensagens recebidas aparecerão aqui.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.phone_number}
                onClick={() => handleSelect(conv)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 ${
                  selected?.phone_number === conv.phone_number ? "bg-white/10" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {conv.phone_number.split("@")[0].slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-[13px] truncate">{formatPhone(conv.phone_number)}</span>
                    {conv.has_pending && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 ml-1 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">{conv.last_message}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: conversation + copilot editor */}
      {selected ? (
        <div className="flex-1 glass rounded-2xl border border-white/5 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">{formatPhone(selected.phone_number)}</p>
              <p className="text-[10px] text-muted-foreground">{selected.messages.filter(m => m.role !== 'copilot').length} mensagens</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selected.messages
              .filter((m) => m.role !== "copilot")
              .map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "" : "flex-row-reverse"}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-white/10 text-foreground rounded-tl-none"
                      : "bg-primary/15 text-foreground rounded-tr-none"
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-left" : "text-right"}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Copilot suggestion editor */}
          {selected.has_pending ? (
            <div className="p-4 border-t border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Edit3 className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                  Sugestão do Copilot — revise e envie
                </span>
              </div>
              <textarea
                value={editedSuggestion}
                onChange={(e) => setEditedSuggestion(e.target.value)}
                rows={3}
                className="w-full bg-black/40 border border-primary/20 rounded-xl p-3 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
                placeholder="Sugestão da IA aparecerá aqui..."
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-muted-foreground">Você pode editar antes de enviar</p>
                <Button
                  onClick={handleSend}
                  disabled={sending || !editedSuggestion.trim()}
                  className="bg-primary text-primary-foreground font-bold h-9 px-5 flex items-center gap-2 text-sm"
                >
                  {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {sending ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-white/5 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              Nenhuma sugestão pendente — aguardando próxima mensagem do cliente
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 glass rounded-2xl border border-white/5 flex items-center justify-center text-center p-8">
          <div>
            <MessageSquare className="w-12 h-12 text-primary/20 mx-auto mb-3" />
            <p className="font-semibold text-white/60 text-sm">Selecione uma conversa</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              As sugestões do Copilot aparecem aqui para você revisar antes de enviar
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
