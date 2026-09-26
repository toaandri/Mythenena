"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Plus, Send, Users } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { apiFetch } from "@/lib/api";
import { useSession } from "@/lib/context/SessionContext";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";

type Category = { id: string; slug: string; labelFr: string; labelMg: string; description: string };
type Reaction = { type: string; count: number; active: boolean };
type Post = { id: string; pseudonym: string; content: string; categoryId: string; repliesCount: number; reactions: Reaction[]; createdAt: string; isMine: boolean };
type CategoriesResponse = { categories: Category[] };
type PostsResponse = { items: Post[] };

export default function ForumPage() {
  const { t, lang } = useLang();
  const { ensureSession } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { void apiFetch<CategoriesResponse>("/api/forum/categories", { auth: false }).then((data) => { setCategories(data.categories); setSelected(data.categories[0] ?? null); }).catch((cause) => setError(cause instanceof Error ? cause.message : "Forum indisponible.")).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    if (!selected) return;
    void apiFetch<PostsResponse>(`/api/forum/posts?category=${encodeURIComponent(selected.slug)}&limit=50`, { auth: false })
      .then((data) => { setPosts(data.items); setError(""); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Publications indisponibles."));
  }, [selected]);

  const publish = async () => {
    if (!selected || !content.trim()) return;
    setSending(true); setError("");
    try {
      await ensureSession(lang === "mg" ? "mg" : "fr");
      const result = await apiFetch<{ post: Post }>("/api/forum/posts", { method: "POST", body: JSON.stringify({ categoryId: selected.id, content: content.trim() }) });
      setPosts((current) => [result.post, ...current]); setContent("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "La publication n'a pas pu être envoyée."); }
    finally { setSending(false); }
  };
  const react = async (post: Post) => {
    try {
      await ensureSession(lang === "mg" ? "mg" : "fr");
      await apiFetch(`/api/forum/posts/${post.id}/react`, { method: "POST", body: JSON.stringify({ type: "support" }) });
      const refreshed = await apiFetch<PostsResponse>(`/api/forum/posts?category=${encodeURIComponent(selected?.slug ?? "")}&limit=50`, { auth: false });
      setPosts(refreshed.items);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "La réaction n'a pas été enregistrée."); }
  };

  return <Container size="wide" className="animate-fade-rise flex flex-col gap-7 py-10 sm:py-12">
    <PageHeader title={t.forum.pageTitle} subtitle={t.forum.pageSubtitle} />
    {error && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">{error}</p>}
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      <Card className="gap-2 p-3"><p className="px-2 pb-1 text-sm font-semibold text-ink">{t.forum.topicsTitle}</p>{loading ? <p className="p-2 text-sm text-ink-muted">Chargement…</p> : categories.map((category) => <button key={category.id} type="button" onClick={() => setSelected(category)} className={`rounded-xl p-3 text-left transition-colors ${selected?.id === category.id ? "bg-brand-softer text-brand" : "text-ink-muted hover:bg-surface-2"}`}><span className="block text-sm font-semibold">{lang === "mg" ? category.labelMg : category.labelFr}</span><span className="mt-1 block text-xs leading-relaxed">{category.description}</span></button>)}</Card>
      <div className="flex flex-col gap-4">
        {selected && <Card className="gap-3 p-5"><div className="flex items-center gap-2"><Users size={17} className="text-brand" /><h2 className="font-semibold text-ink">{lang === "mg" ? selected.labelMg : selected.labelFr}</h2><Badge tone="brand">{posts.length}</Badge></div><Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} maxLength={2000} placeholder={t.forum.messagePlaceholder} /><div className="flex justify-end"><Button onClick={() => void publish()} disabled={!content.trim() || sending} loading={sending}><Plus size={16} />Publier anonymement</Button></div></Card>}
        {posts.length === 0 && selected && <Card className="p-6 text-sm text-ink-muted">Aucune publication pour le moment. Tu peux ouvrir la discussion de façon anonyme.</Card>}
        {posts.map((post) => { const support = post.reactions.find((reaction) => reaction.type === "support"); return <Card key={post.id} className="gap-3 p-5"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">{post.pseudonym.charAt(0)}</span><div><p className="text-sm font-semibold text-ink">{post.pseudonym}</p><p className="text-xs text-ink-muted">{new Date(post.createdAt).toLocaleString(lang === "mg" ? "fr-FR" : lang)}</p></div></div><p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{post.content}</p><div className="flex gap-3"><button type="button" onClick={() => void react(post)} className={`inline-flex items-center gap-1.5 text-xs font-medium ${support?.active ? "text-brand" : "text-ink-muted"}`}><Heart size={15} fill={support?.active ? "currentColor" : "none"} />{support?.count ?? 0}</button><span className="inline-flex items-center gap-1.5 text-xs text-ink-muted"><MessageCircle size={15} />{post.repliesCount}</span></div></Card>; })}
      </div>
    </div>
  </Container>;
}
