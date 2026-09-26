"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, SendHorizonal, MoreVertical, Mic, Phone, Search } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { Badge, Dot } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Message = { 
  id: string; 
  role: "me" | "them"; 
  text: string; 
  time: string;
  type?: "text" | "voice";
  status?: "sending" | "sent" | "delivered" | "read";
};

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
};

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Marie R.", avatar: "MR", lastMessage: "Ca va mieux aujourd'hui ?", time: "10:30", unread: 2, online: true },
  { id: "2", name: "Jean M.", avatar: "JM", lastMessage: "Merci pour ton soutien", time: "09:15", unread: 0, online: false },
  { id: "3", name: "Sarah K.", avatar: "SK", lastMessage: "On se voit cette semaine ?", time: "Hier", unread: 1, online: true },
  { id: "4", name: "Paul D.", avatar: "PD", lastMessage: "Prends soin de toi", time: "Hier", unread: 0, online: false },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    { id: "1", role: "them", text: "Salut ! Comment tu vas ?", time: "10:25", status: "read" },
    { id: "2", role: "me", text: "Salut ! Ca va mieux, merci. Et toi ?", time: "10:26", status: "read" },
    { id: "3", role: "them", text: "Ca va mieux aujourd'hui ?", time: "10:30", status: "delivered" },
  ],
  "2": [
    { id: "1", role: "them", text: "J'ai pense a toi", time: "09:10", status: "read" },
    { id: "2", role: "me", text: "Merci pour ton soutien", time: "09:15", status: "read" },
  ],
  "3": [
    { id: "1", role: "them", text: "Salut !", time: "Hier", status: "read" },
    { id: "2", role: "me", text: "Salut ! Ca va ?", time: "Hier", status: "read" },
    { id: "3", role: "them", text: "On se voit cette semaine ?", time: "Hier", status: "delivered" },
  ],
  "4": [
    { id: "1", role: "them", text: "Prends soin de toi", time: "Hier", status: "read" },
  ],
};

function MessagesModal({ open, onClose, t }: { open: boolean; onClose: () => void; t: any }) {
  return (
    <Dialog open={open} onClose={onClose} title={t.messagesTitle} description={t.messagesDesc}>
      <div className="flex flex-col gap-4">
        <Button variant="soft" className="w-full justify-start gap-3 text-left py-4" onClick={onClose}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <MessageSquare size={20} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink">{t.textChat}</p>
            <p className="text-sm text-ink-muted">{t.textChatDesc}</p>
          </div>
        </Button>
        <Button variant="soft" className="w-full justify-start gap-3 text-left py-4" onClick={onClose}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Phone size={20} aria-hidden />
          </span>
          <div>
            <p className="font-semibold text-ink">{t.voiceCall}</p>
            <p className="text-sm text-ink-muted">{t.voiceCallDesc}</p>
          </div>
        </Button>
        <Button variant="soft" className="w-full justify-start gap-3 text-left py-4" onClick={onClose}>
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

export default function MessagesPage() {
  const { t } = useLang();
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeConversation) {
      setMessages(MOCK_MESSAGES[activeConversation] || []);
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeConversation, messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
    };

    setInput("");
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      setMessages((prev) => prev.map((m) => 
        m.id === newMessage.id ? { ...m, status: "sent" } : m
      ));
    }, 500);

    setTimeout(() => {
      setMessages((prev) => prev.map((m) => 
        m.id === newMessage.id ? { ...m, status: "delivered" } : m
      ));
    }, 1500);
  };

  const selectConversation = (id: string) => {
    setActiveConversation(id);
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="border-b border-line bg-surface/90 backdrop-blur-xl">
        <Container size="wide" className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand text-brand-on">
              <MessageSquare size={18} aria-hidden />
              <span className="absolute -bottom-0.5 -right-0.5">
                <Dot tone="success" pulse />
              </span>
            </span>
            <div>
              <h1 className="text-h3 text-ink">{t.messages.title}</h1>
              <p className="text-[0.75rem] text-ink-muted">{t.messages.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setMessagesOpen(true)} aria-label={t.messages.title} className="h-10 w-10 shrink-0 rounded-xl p-0">
              <MessageSquare size={18} aria-hidden />
            </Button>
          </div>
        </Container>
      </div>

      <Container size="wide" className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-line bg-surface flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-line">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" aria-hidden />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.messages.search}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-2 text-ink placeholder-ink-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-ink-muted">
                <MessageSquare size={32} className="mx-auto mb-3 text-ink-subtle" />
                <p>{t.messages.emptyDesc}</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {filteredConversations.map((conv) => (
                  <li key={conv.id}>
                    <button
                      onClick={() => selectConversation(conv.id)}
                      className={cn(
                        "w-full p-4 flex items-start gap-3 text-left transition-colors hover:bg-surface-2",
                        activeConversation === conv.id && "bg-brand-softer"
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand font-semibold text-sm">
                          {conv.avatar}
                        </span>
                        {conv.online && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-success border-2 border-surface" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-ink truncate">{conv.name}</h3>
                          <span className="text-tiny text-ink-subtle whitespace-nowrap">{conv.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-ink-muted truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand text-brand-on text-tiny font-semibold px-1.5">
                          {conv.unread > 9 ? "9+" : conv.unread}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {activeConversation ? (
            <>
              <div className="border-b border-line bg-surface/90 backdrop-blur-xl">
                <Container size="wide" className="flex h-16 items-center gap-3 px-4">
                  {(() => {
                    const conv = conversations.find((c) => c.id === activeConversation);
                    if (!conv) return null;
                    return (
                      <>
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand font-semibold text-sm">
                          {conv.avatar}
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-semibold text-ink truncate">{conv.name}</h2>
                          <p className="text-tiny text-ink-muted flex items-center gap-1">
                            {conv.online && (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                {t.messages.online}
                              </>
                            )}
                            {!conv.online && t.messages.offline}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </Container>
              </div>

              <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2 max-w-[75%]",
                      msg.role === "me" && "flex-row-reverse ml-auto"
                    )}
                  >
                    {msg.role === "them" && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand text-xs font-semibold">
                        {conversations.find((c) => c.id === activeConversation)?.avatar?.[0]}
                      </span>
                    )}

                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-[0.875rem] leading-relaxed",
                        msg.role === "me"
                          ? "rounded-br-md bg-brand text-brand-on shadow-brand"
                          : "rounded-bl-md border border-line bg-surface text-ink shadow-sm"
                      )}
                    >
                      {msg.type === "voice" ? (
                        <div className="flex items-center gap-2">
                          <Mic size={16} className="text-brand" />
                          <span className="text-sm">{t.messages.voiceMsg}</span>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {msg.role === "me" && msg.status && (
                      <span className="flex items-center gap-1 text-tiny text-ink-subtle shrink-0 mt-1 ml-2">
                        {msg.status === "sending" && <span className="animate-spin">...</span>}
                        {msg.status === "sent" && <span>✓</span>}
                        {msg.status === "delivered" && <span>✓✓</span>}
                        {msg.status === "read" && <span className="text-brand">✓✓</span>}
                      </span>
                    )}
                  </div>
                ))}

                <div ref={bottomRef} />
              </div>

              <div className="border-t border-line bg-surface/90 backdrop-blur-xl">
                <Container size="wide" className="py-4 px-4">
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
                      placeholder={t.messages.placeholder}
                      aria-label={t.messages.placeholder}
                      className="max-h-40 min-h-11 flex-1 resize-none py-2.5"
                    />
                    <Button onClick={send} disabled={!input.trim()} aria-label={t.messages.send} className="h-11 w-11 shrink-0 rounded-xl p-0">
                      <SendHorizonal size={18} aria-hidden />
                    </Button>
                    <Button variant="outline" onClick={() => setMessagesOpen(true)} aria-label={t.messages.more} className="h-11 w-11 shrink-0 rounded-xl p-0">
                      <MoreVertical size={18} aria-hidden />
                    </Button>
                  </div>
                </Container>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare size={48} className="text-ink-subtle mb-4" />
              <h2 className="text-h2 text-ink mb-2">{t.messages.emptyTitle}</h2>
              <p className="text-ink-muted max-w-md">{t.messages.emptyDesc}</p>
              <Button variant="outline" onClick={() => setMessagesOpen(true)} className="mt-6">
                <MessageSquare size={16} aria-hidden />
                {t.messages.newConversation}
              </Button>
            </div>
          )}
        </div>
      </Container>

      <MessagesModal open={messagesOpen} onClose={() => setMessagesOpen(false)} t={t.messages} />
    </div>
  );
}