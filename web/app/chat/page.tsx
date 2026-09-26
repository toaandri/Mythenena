"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Lock, SendHorizonal, Sparkles, Mic, MessageSquare, Phone, X } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { useTranslate } from "@/lib/useTranslate";
import { Container } from "@/components/layout/Container";
import { Badge, Dot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";

export const dynamic = "force-dynamic";

type Message = { role: "ai" | "user"; text: string; translating?: boolean };

const CRISIS_KEYWORDS = [
  "suicide", "mourir", "me tuer", "en finir", "plus envie de vivre", "maty", "fandringanana tena",
];

const AI_RESPONSES: Record<string, string> = {
  default: "Je vous entends. Pouvez-vous m'en dire un peu plus sur ce que vous ressentez ?",
  triste: "La tristesse peut être très lourde à porter. Depuis combien de temps ressentez-vous cela ?",
  anxieux: "L'anxiété peut être épuisante. Avez-vous remarqué des situations qui l'aggravent ?",
  seul: "Se sentir seul est une expérience difficile. Avez-vous des personnes autour de vous à qui vous pouvez parler ?",
  fatigue: "La fatigue émotionnelle est réelle. Prenez-vous soin de votre sommeil et de votre alimentation ?",
  merci: "Je suis là pour vous. N'hésitez pas à continuer à vous exprimer.",
};

function pickResponse(text: string): string {
  const lower = text.toLowerCase();
  if (CRISIS_KEYWORDS.some((k) => lower.includes(k))) return "__crisis__";
  if (lower.includes("triste") || lower.includes("déprim") || lower.includes("alahelo")) return AI_RESPONSES.triste;
  if (lower.includes("anxieux") || lower.includes("angoisse") || lower.includes("ahiahy")) return AI_RESPONSES.anxieux;
  if (lower.includes("seul") || lower.includes("isolé") || lower.includes("irery")) return AI_RESPONSES.seul;
  if (lower.includes("fatigué") || lower.includes("épuisé") || lower.includes("vizana")) return AI_RESPONSES.fatigue;
  if (lower.includes("merci") || lower.includes("misaotra")) return AI_RESPONSES.merci;
  return AI_RESPONSES.default;
}

/* ─── Modal Messages (texte + appel) ─── */
function MessagesModal({ open, onClose, t }: { open: boolean; onClose: () => void; t: any }) {
  return (
    <Dialog open={open} onClose={onClose} title={t.messagesTitle} description={t.messagesDesc}>
      <div className="flex flex-col gap-4">
        {/* Chat texte */}
        <Button
          variant="soft"
          className="w-full justify-start gap-3 text-left py-4"
          onClick={() => { onClose(); }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <MessageSquare size={20} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink">{t.textChat}</p>
            <p className="text-sm text-ink-muted">{t.textChatDesc}</p>
          </div>
        </Button>

        {/* Appel vocal */}
        <Button
          variant="soft"
          className="w-full justify-start gap-3 text-left py-4"
          onClick={() => { onClose(); }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Phone size={20} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink">{t.voiceCall}</p>
            <p className="text-sm text-ink-muted">{t.voiceCallDesc}</p>
          </div>
        </Button>

        {/* Message vocal */}
        <Button
          variant="soft"
          className="w-full justify-start gap-3 text-left py-4"
          onClick={() => { onClose(); }}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Mic size={20} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink">{t.voiceMessage}</p>
            <p className="text-sm text-ink-muted">{t.voiceMessageDesc}</p>
          </div>
        </Button>
      </div>
    </Dialog>
  );
}

export default function ChatPage() {
  const { t, lang } = useLang();
  const { translate } = useTranslate();

  const [messages, setMessages] = useState<Message[]>([{ role: "ai", text: t.chat.greeting }]);
  const [input, setInput] = useState("");
  const [crisis, setCrisis] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  // Le composeur grandit avec le texte, jusqu'à une hauteur confortable.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setTyping(true);

    await new Promise((r) => setTimeout(r, 900));
    setTyping(false);

    const raw = pickResponse(text);

    if (raw === "__crisis__") {
      setCrisis(true);
      const crisisText = lang === "fr" ? t.chat.crisisMsg : await translate(t.chat.crisisMsg, "fr");
      setMessages((prev) => [...prev, { role: "ai", text: crisisText }]);
      return;
    }

    if (lang !== "fr") {
      setMessages((prev) => [...prev, { role: "ai", text: "…", translating: true }]);
      const translated = await translate(raw, "fr");
      setMessages((prev) => prev.map((m) => (m.translating ? { ...m, text: translated } : m)));
    } else {
      setMessages((prev) => [...prev, { role: "ai", text: raw }]);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Bandeau contextuel */}
      <div className="border-b border-line bg-brand-softer">
        <Container size="narrow" className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-on">
              <Sparkles size={18} aria-hidden />
              <span className="absolute -bottom-0.5 -right-0.5">
                <Dot tone="success" pulse />
              </span>
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{t.chat.title}</p>
              <p className="text-[0.75rem] text-ink-muted">{t.chat.online}</p>
            </div>
          </div>
          <Badge tone="brand" icon={<Lock size={11} aria-hidden />}>
            {t.chat.confidential}
          </Badge>
        </Container>
      </div>

      {/* Alerte situation de détresse */}
      {crisis && (
        <Container size="narrow" className="pt-5">
          <div
            role="alert"
            className="flex items-start gap-3.5 rounded-2xl border border-brand/25 bg-brand-soft p-5"
          >
            <AlertTriangle size={19} className="mt-0.5 shrink-0 text-brand" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-ink">{t.chat.crisisTitle}</p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-muted">{t.chat.crisisMsg}</p>
            </div>
          </div>
        </Container>
      )}

      {/* Fil de discussion */}
      <Container size="narrow" className="flex flex-1 flex-col gap-4 py-7">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "ai" && <AiAvatar />}

            <div
              className={`max-w-[78%] animate-bubble-in rounded-2xl px-4 py-2.5 text-[0.875rem] leading-relaxed sm:max-w-[72%] ${
                msg.role === "user"
                  ? "rounded-br-md bg-brand text-brand-on shadow-brand"
                  : "rounded-bl-md border border-line bg-surface text-ink shadow-sm"
              }`}
            >
              {msg.translating ? <TypingDots /> : msg.text}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-end gap-2.5">
            <AiAvatar />
            <div className="rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </Container>

      {/* Composeur */}
      <div className="sticky bottom-0 border-t border-line bg-surface/90 backdrop-blur-xl">
        <Container size="narrow" className="py-4">
          <div className="flex items-end gap-2.5">
            <Textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t.chat.placeholder}
              aria-label={t.chat.placeholder}
              className="max-h-40 min-h-11 flex-1 resize-none py-2.5"
            />
            <Button
              onClick={send}
              disabled={!input.trim() || typing}
              aria-label={t.chat.send}
              className="h-11 w-11 shrink-0 rounded-xl p-0"
            >
              <SendHorizonal size={18} aria-hidden />
            </Button>
            {/* Bouton Messages (texte + appel) */}
            <Button
              variant="outline"
              onClick={() => setMessagesOpen(true)}
              aria-label={t.chat.messagesTitle}
              className="h-11 w-11 shrink-0 rounded-xl p-0"
            >
              <MessageSquare size={18} aria-hidden />
            </Button>
          </div>
          <p className="mt-2.5 text-center text-[0.7rem] text-ink-subtle">{t.chat.disclaimerShort}</p>
        </Container>
      </div>

      <MessagesModal open={messagesOpen} onClose={() => setMessagesOpen(false)} t={t.chat} />
    </div>
  );
}

function AiAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
      <Sparkles size={14} aria-hidden />
    </span>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-dot-bounce rounded-full bg-brand"
          style={{ animationDelay: `${d * 0.15}s` }}
        />
      ))}
    </span>
  );
}
