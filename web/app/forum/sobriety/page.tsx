"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Heart, MoreVertical, Shield, Users } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Message = {
  id: number;
  author: string;
  time: string;
  content: string;
  likes: number;
  liked: boolean;
  isCurrentUser: boolean;
};

const INITIAL_MESSAGES: Message[] = [
  { id: 1, author: "Pierre_38", time: "14:20", content: "Aujourd'hui ça fait 30 jours sans alcool. Je ne pensais pas y arriver.", likes: 8, liked: false, isCurrentUser: false },
  { id: 2, author: "Lea_29", time: "14:23", content: "Félicitations Pierre ! C'est énorme. 30 jours, c'est une vraie victoire. 💚", likes: 10, liked: false, isCurrentUser: false },
  { id: 3, author: "Utilisateur_412", time: "14:27", content: "Moi j'en suis à 3 jours. C'est dur mais je tiens. Vos messages m'aident.", likes: 5, liked: false, isCurrentUser: true },
  { id: 4, author: "Marc_52", time: "14:30", content: "Un jour à la fois. Les 3 premiers jours sont les plus durs. Tu es sur la bonne voie.", likes: 7, liked: false, isCurrentUser: false },
];

export default function SobrietyChatPage() {
  const { t } = useLang();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      author: "Vous",
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      content: input.trim(),
      likes: 0,
      liked: false,
      isCurrentUser: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const toggleLike = (id: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, likes: m.liked ? m.likes - 1 : m.likes + 1, liked: !m.liked } : m
      )
    );
  };

  const topic = {
    name: "Chemin vers la sobriété",
    participants: 15,
    description: "Groupe de parole pour l'entraide face aux addictions (alcool, drogues, etc.). Sobre aujourd'hui, plus fort demain.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 6v6l4 2" />
        <path d="M14 14a4 4 0 1 1-8 0" />
        <path d="M12 14v4" />
        <path d="M10 18h4" />
      </svg>
    ),
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-shell items-center gap-3 px-4">
          <button
            onClick={() => window.history.back()}
            className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Retour"
          >
            <ArrowLeft size={19} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {topic.icon}
              </span>
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-ink truncate">{topic.name}</h1>
                <p className="text-[0.75rem] text-ink-muted">{topic.participants} {t.forum.participants} · {t.forum.anonymous}</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              ref={menuRef}
              className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
              aria-label="Options"
            >
              <MoreVertical size={19} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 animate-scale-in overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lg">
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.8125rem] text-ink-muted">
                  <Shield size={16} className="text-emerald-600" />
                  <span>{t.forum.groupRules}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.8125rem] text-ink-muted">
                  <Users size={16} className="text-emerald-600" />
                  <span>{t.forum.membersList}</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[0.8125rem] text-danger">
                  <span>{t.forum.leaveGroup}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">
        <Container size="wide" className="flex flex-col h-full max-h-full">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[85%] animate-bubble-in",
                  msg.isCurrentUser ? "self-end flex-row-reverse" : "self-start"
                )}
              >
                {!msg.isCurrentUser && (
                  <span className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                    {msg.author.charAt(0)}
                  </span>
                )}
                <Card
                  className={cn(
                    "flex flex-col gap-1.5 px-4 py-3",
                    msg.isCurrentUser
                      ? "bg-emerald-600 text-white rounded-2xl rounded-br-md"
                      : "bg-surface rounded-2xl rounded-bl-md border border-line"
                  )}
                >
                  {!msg.isCurrentUser && (
                    <div className="flex items-center gap-2 text-[0.6875rem] font-medium text-ink-muted">
                      <span>{msg.author}</span>
                      <span aria-hidden>·</span>
                      <span>{msg.time}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleLike(msg.id)}
                      aria-pressed={msg.liked}
                      aria-label={`${msg.likes} ${t.forum.like}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[0.6875rem] font-medium transition-colors",
                        msg.liked ? "text-emerald-600" : "text-ink-muted hover:text-ink",
                        msg.isCurrentUser ? "text-white/80 hover:text-white" : ""
                      )}
                    >
                      <Heart size={14} fill={msg.liked ? "currentColor" : "none"} />
                      {msg.likes > 0 && msg.likes}
                    </button>
                    {msg.isCurrentUser && (
                      <span className="text-[0.6875rem] text-white/60">{msg.time}</span>
                    )}
                  </div>
                </Card>
                {msg.isCurrentUser && (
                  <span className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-medium">
                    V
                  </span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </Container>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-line bg-surface/95 backdrop-blur-xl p-4">
        <Container size="wide">
          <div className="flex items-end gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={t.forum.messagePlaceholder}
              className="flex-1 h-11 rounded-full pl-4 pr-3 text-sm"
              aria-label={t.forum.messagePlaceholder}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="h-11 w-11 rounded-full p-0 bg-emerald-600 hover:bg-emerald-700 text-white"
              aria-label={t.forum.send}
            >
              <Send size={18} />
            </Button>
          </div>
        </Container>
      </div>
    </div>
  );
}