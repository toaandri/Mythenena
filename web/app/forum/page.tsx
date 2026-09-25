"use client";

import { useMemo, useState } from "react";
import { Heart, MessageCircle, Plus, Search, TrendingUp, UserRound } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container } from "@/components/layout/Container";
import { PageHeader, EmptyState } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

type Post = {
  id: number;
  catIndex: number;
  author: string;
  time: string;
  title: string;
  body: string;
  likes: number;
  replies: number;
};

const INITIAL_POSTS: Post[] = [
  { id: 1, catIndex: 1, author: "Utilisateur_482", time: "il y a 2h", title: "Comment traverser les jours sans énergie ?", body: "Certains matins je n'arrive même pas à me lever. Est-ce que quelqu'un a des stratégies qui fonctionnent vraiment ?", likes: 14, replies: 6 },
  { id: 2, catIndex: 3, author: "Utilisateur_219", time: "il y a 5h", title: "Je n'arrive pas à m'accepter tel que je suis", body: "Depuis l'enfance j'ai toujours eu l'impression de ne pas être assez bien. Je cherche des témoignages.", likes: 9, replies: 4 },
  { id: 3, catIndex: 2, author: "Utilisateur_731", time: "il y a 1j", title: "Crises d'angoisse au travail — comment gérer ?", body: "Mon cœur s'emballe sans raison apparente. J'ai essayé la respiration mais ça ne suffit pas toujours.", likes: 21, replies: 11 },
  { id: 4, catIndex: 4, author: "Utilisateur_104", time: "il y a 2j", title: "Relation toxique : comment reconnaître les signes ?", body: "Je me demande si ce que je vis est normal. Mon partenaire minimise toujours mes émotions.", likes: 17, replies: 8 },
  { id: 5, catIndex: 5, author: "Utilisateur_567", time: "il y a 3j", title: "100 jours sans alcool — mon retour d'expérience", body: "Je voulais partager ce que j'ai appris sur moi-même durant ces 100 jours. C'est difficile mais possible.", likes: 38, replies: 15 },
];

export default function ForumPage() {
  const { t } = useLang();
  const categories = t.forum.categories;

  const [activeCat, setActiveCat] = useState(0);
  const [search, setSearch] = useState("");
  const [popular, setPopular] = useState(false);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [liked, setLiked] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", catIndex: 1 });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = posts.filter(
      (p) =>
        (activeCat === 0 || p.catIndex === activeCat) &&
        (!query || p.title.toLowerCase().includes(query) || p.body.toLowerCase().includes(query))
    );
    return popular ? [...list].sort((a, b) => b.likes - a.likes) : list;
  }, [posts, activeCat, search, popular]);

  const toggleLike = (id: number) => {
    const isLiked = liked.includes(id);
    setLiked((prev) => (isLiked ? prev.filter((x) => x !== id) : [...prev, id]));
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p)));
  };

  const submit = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setPosts((prev) => [
      {
        id: Date.now(),
        catIndex: form.catIndex,
        author: `Utilisateur_${Math.floor(Math.random() * 900 + 100)}`,
        time: "à l'instant",
        title: form.title.trim(),
        body: form.body.trim(),
        likes: 0,
        replies: 0,
      },
      ...prev,
    ]);
    setForm({ title: "", body: "", catIndex: 1 });
    setOpen(false);
    setActiveCat(0);
  };

  return (
    <>
      <Container size="wide" className="animate-fade-rise flex flex-col gap-8 py-10 sm:py-12">
        <PageHeader
          title={t.forum.pageTitle}
          subtitle={t.forum.pageSubtitle}
          actions={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} aria-hidden />
              {t.forum.newTopic}
            </Button>
          }
        />

        {/* Filtres */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.forum.searchPlaceholder}
                aria-label={t.forum.searchPlaceholder}
                className="pl-11"
              />
            </div>
            <Button
              variant={popular ? "soft" : "outline"}
              onClick={() => setPopular((v) => !v)}
              aria-pressed={popular}
              className="shrink-0"
            >
              <TrendingUp size={16} aria-hidden />
              {popular ? t.forum.sortPopular : t.forum.sortRecent}
            </Button>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label={t.forum.category}>
            <div className="flex w-max gap-2">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCat === i}
                  onClick={() => setActiveCat(i)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-[0.8125rem] font-semibold transition-all duration-200",
                    activeCat === i
                      ? "border-brand bg-brand text-brand-on shadow-brand"
                      : "border-line bg-surface text-ink-muted hover:border-brand-line hover:text-ink"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fils */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={22} aria-hidden />}
            title={search ? t.forum.noResults : t.forum.empty}
            description={t.forum.emptyDesc}
            action={
              <Button onClick={() => setOpen(true)}>
                <Plus size={16} aria-hidden />
                {t.forum.emptyCta}
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3.5">
            {filtered.map((post) => {
              const isLiked = liked.includes(post.id);
              return (
                <li key={post.id}>
                  <Card className="gap-4 p-5 transition-shadow duration-300 hover:shadow-md sm:p-6">
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <UserRound size={16} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[0.8125rem] font-semibold text-ink">{post.author}</span>
                          <span className="text-ink-subtle" aria-hidden>
                            ·
                          </span>
                          <span className="text-[0.75rem] text-ink-subtle">{post.time}</span>
                          <Badge tone="neutral" className="ml-auto">
                            {categories[post.catIndex]}
                          </Badge>
                        </div>

                        <h2 className="mt-2.5 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-ink">
                          {post.title}
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{post.body}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 border-t border-line pt-3.5">
                      <button
                        type="button"
                        onClick={() => toggleLike(post.id)}
                        aria-pressed={isLiked}
                        aria-label={`${t.forum.like} — ${post.likes}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-semibold transition-all duration-200",
                          isLiked
                            ? "bg-accent-soft text-accent"
                            : "text-ink-muted hover:bg-surface-3 hover:text-ink"
                        )}
                      >
                        <Heart size={15} fill={isLiked ? "currentColor" : "none"} aria-hidden />
                        {post.likes}
                      </button>

                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-ink-subtle">
                        <MessageCircle size={15} aria-hidden />
                        {post.replies} {t.forum.replies}
                      </span>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Container>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t.forum.newTopic}
        description={t.forum.anonymousNote}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} className="sm:min-w-32">
              {t.forum.cancel}
            </Button>
            <Button
              onClick={submit}
              disabled={!form.title.trim() || !form.body.trim()}
              className="sm:min-w-32"
            >
              {t.forum.publish}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label={t.forum.category} htmlFor="post-cat">
            <Select
              id="post-cat"
              value={form.catIndex}
              onChange={(e) => setForm((f) => ({ ...f, catIndex: Number(e.target.value) }))}
            >
              {categories.slice(1).map((c, i) => (
                <option key={c} value={i + 1}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field label={t.forum.newTopic} htmlFor="post-title">
            <Input
              id="post-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t.forum.titlePlaceholder}
              maxLength={120}
            />
          </Field>

          <Field label={t.forum.bodyPlaceholder} htmlFor="post-body">
            <Textarea
              id="post-body"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder={t.forum.bodyPlaceholder}
              maxLength={1200}
            />
          </Field>
        </div>
      </Dialog>
    </>
  );
}
