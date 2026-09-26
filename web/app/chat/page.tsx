"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Lock, SendHorizonal, Sparkles } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/context/SessionContext";
import { Container } from "@/components/layout/Container";
import { Badge, Dot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";

export const dynamic = "force-dynamic";

type Message = { role: "ai" | "user"; text: string };
type ChatHistory = { messages: Array<{ role: "user" | "assistant"; content: string }> };
type ChatResponse = { message: { role: "assistant"; content: string } | null; safetyAlert?: unknown };

export default function ChatPage() {
  const { t, lang } = useLang();
  const { ensureSession } = useSession();
  const [messages, setMessages] = useState<Message[]>([{ role: "ai", text: t.chat.greeting }]);
  const [input, setInput] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const apiLanguage = lang === "mg" ? "mg" : "fr";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const session = await ensureSession(apiLanguage);
        const history = await apiFetch<ChatHistory>(`/api/chat/${session.id}`);
        if (active && history.messages.length) {
          setMessages(history.messages.map((message) => ({
            role: message.role === "assistant" ? "ai" : "user",
            text: message.content,
          })));
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Connexion au service impossible.");
      }
    })();
    return () => { active = false; };
  }, [apiLanguage, ensureSession]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    setError("");
    setMessages((previous) => [...previous, { role: "user", text }]);
    setTyping(true);
    try {
      await ensureSession(apiLanguage);
      const response = await apiFetch<ChatResponse>("/api/chat/message", {
        method: "POST",
        body: JSON.stringify({ message: text, language: apiLanguage }),
      });
      if (response.safetyAlert) setCrisis(true);
      if (response.message) setMessages((previous) => [...previous, { role: "ai", text: response.message!.content }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Le message n'a pas pu être envoyé.");
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="border-b border-line bg-brand-softer">
        <Container size="narrow" className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-on">
              <Sparkles size={18} aria-hidden />
              <span className="absolute -bottom-0.5 -right-0.5"><Dot tone="success" pulse /></span>
            </span>
            <div><p className="text-sm font-semibold text-ink">{t.chat.title}</p><p className="text-[0.75rem] text-ink-muted">{t.chat.online}</p></div>
          </div>
          <Badge tone="brand" icon={<Lock size={11} aria-hidden />}>{t.chat.confidential}</Badge>
        </Container>
      </div>

      {(crisis || error) && <Container size="narrow" className="pt-5">
        <div role="alert" className="flex items-start gap-3.5 rounded-2xl border border-brand/25 bg-brand-soft p-5">
          <AlertTriangle size={19} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          <div><p className="text-sm font-semibold text-ink">{crisis ? t.chat.crisisTitle : "Connexion au service"}</p><p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">{crisis ? t.chat.crisisMsg : error}</p></div>
        </div>
      </Container>}

      <Container size="narrow" className="flex flex-1 flex-col gap-4 py-7">
        {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex items-end gap-2.5 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
          {message.role === "ai" && <AiAvatar />}
          <div className={`max-w-[78%] animate-bubble-in rounded-2xl px-4 py-2.5 text-[0.875rem] leading-relaxed sm:max-w-[72%] ${message.role === "user" ? "rounded-br-md bg-brand text-brand-on shadow-brand" : "rounded-bl-md border border-line bg-surface text-ink shadow-sm"}`}>{message.text}</div>
        </div>)}
        {typing && <div className="flex items-end gap-2.5"><AiAvatar /><div className="rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3 shadow-sm"><TypingDots /></div></div>}
        <div ref={bottomRef} />
      </Container>

      <div className="sticky bottom-0 border-t border-line bg-surface/90 backdrop-blur-xl">
        <Container size="narrow" className="py-4">
          <div className="flex items-end gap-2.5">
            <Textarea ref={textareaRef} rows={1} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={t.chat.placeholder} aria-label={t.chat.placeholder} className="max-h-40 min-h-11 flex-1 resize-none py-2.5" />
            <Button onClick={() => void send()} disabled={!input.trim() || typing} aria-label={t.chat.send} className="h-11 w-11 shrink-0 rounded-xl p-0"><SendHorizonal size={18} aria-hidden /></Button>
          </div>
          <p className="mt-2.5 text-center text-[0.7rem] text-ink-subtle">{t.chat.disclaimerShort}</p>
        </Container>
      </div>
    </div>
  );
}

function AiAvatar() { return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand"><Sparkles size={14} aria-hidden /></span>; }
function TypingDots() { return <span className="flex items-center gap-1 py-0.5">{[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-brand" style={{ animationDelay: `${dot * 0.15}s` }} />)}</span>; }
