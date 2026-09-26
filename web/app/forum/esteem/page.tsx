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
  { id: 1, author: "Alex_31", time: "10:05", content: "J'ai du mal à m'accepter. Je me compare tout le temps aux autres...", likes: 4, liked: false, isCurrentUser: false },
  { id: 2, author: "Chloe_27", time: "10:08", content: "C'est un chemin, pas une course. Chaque petit pas compte. 💚", likes: 6, liked: false, isCurrentUser: false },
  { id: 3, author: "Utilisateur_203", time: "10:12", content: "L'exercice du miroir m'aide : me dire 3 choses positives chaque matin.", likes: 3, liked: false, isCurrentUser: true },
  { id: 4, author: "Nicolas_45", time: "10:15", content: "Bonne idée ! Je note aussi mes petites victoires du jour le soir.", likes: 5, liked: false, isCurrentUser: false },
];

export default function EsteemChatPage() {
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
    name: "Renforcer l'estime de soi",
    participants: 15,
    description: "Groupe de parole pour travailler l'acceptation de soi et la confiance en soi. Partage d'exercices et de progrès.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66" />
        <path d="m18 15-2-2" />
        <path d="m15 18-2-2" />
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