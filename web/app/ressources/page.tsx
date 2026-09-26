"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { useCssVar } from "@/lib/useCssVar";
import { Container, Section } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { IconBreath, IconBody, IconSenses, IconMuscle, IconVisu } from "@/components/ExerciseIcons";

/* ─── Composant cercle timer ─── */

type Phase = { id: string; label: string; duration: number; color: string };

function CircleTimer({
  phases, title, desc, Icon,
}: {
  phases: Phase[];
  title: string;
  desc: string;
  Icon: React.FC<{ phase: string }>;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const CYCLE = phases.reduce((s, p) => s + p.duration, 0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = () => { setRunning(false); setElapsed(0); };

  const pos = elapsed % CYCLE;
  let acc = 0, index = 0;
  for (let i = 0; i < phases.length; i++) {
    if (pos < acc + phases[i].duration) { index = i; break; }
    acc += phases[i].duration;
  }
  const phase = phases[index];
  const remaining = acc + phase.duration - pos;
  const cycles = Math.floor(elapsed / CYCLE);
  const R = 54, CIRC = 2 * Math.PI * R;
  const progress = running ? (phase.duration - remaining) / phase.duration : 0;

  return (
    <Card className="flex flex-col items-center gap-3 p-4">
      <p className="text-center text-[0.8rem] font-semibold text-ink leading-tight">{title}</p>

      <div className="relative h-36 w-36">
        <svg viewBox="0 0 124 124" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="62" cy="62" r={R} fill="none" strokeWidth="6" stroke="var(--color-surface-3, #e5e7eb)" />
          <circle cx="62" cy="62" r={R} fill="none" strokeWidth="6" strokeLinecap="round"
            style={{ stroke: phase.color, transition: "stroke-dashoffset 0.7s linear, stroke 0.4s" }}
            strokeDasharray={CIRC} strokeDashoffset={CIRC - progress * CIRC} />
        </svg>

        {/* Icône animée au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Icon phase={running ? phase.id : ""} />
          {running && (
            <span className="text-lg font-bold tabular-nums leading-none" style={{ color: phase.color }}>
              {remaining}
            </span>
          )}
        </div>
      </div>

      {running && (
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-ink-muted text-center">
          {phase.label} · cycle {cycles + 1}
        </p>
      )}

      <p className="text-center text-[0.72rem] leading-relaxed text-ink-muted line-clamp-2">{desc}</p>

      {running ? (
        <button onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[0.75rem] font-semibold text-ink-muted transition-colors hover:bg-surface-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          Arrêter
        </button>
      ) : (
        <button onClick={() => setRunning(true)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: phase.color }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          Commencer
        </button>
      )}
    </Card>
  );
}

/* ─── 5 exercices côte à côte ─── */

function Exercises() {
  const { t } = useLang();
  const brand = useCssVar("--brand");
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <CircleTimer
        title={t.ressources.breathing}
        desc={t.ressources.breathingDesc}
        Icon={IconBreath}
        phases={[
          { id: "inhale", label: t.ressources.inhale, duration: 4, color: brand },
          { id: "hold",   label: t.ressources.hold,   duration: 7, color: brand },
          { id: "exhale", label: t.ressources.exhale, duration: 8, color: brand },
        ]}
      />
      {/* label affiché sous le cercle pour la respiration */}
      <CircleTimer
        title="Scan corporel"
        desc="Relâchez les tensions de chaque partie du corps."
        Icon={IconBody}
        phases={[
          { id: "legs",   label: "Pieds & jambes",  duration: 10, color: brand },
          { id: "torso",  label: "Ventre & dos",    duration: 10, color: brand },
          { id: "arms",   label: "Épaules & bras",  duration: 10, color: brand },
          { id: "head",   label: "Visage & tête",   duration: 10, color: brand },
        ]}
      />
      <CircleTimer
        title="Ancrage 5-4-3-2-1"
        desc="Revenez au présent en mobilisant vos 5 sens."
        Icon={IconSenses}
        phases={[
          { id: "vue",     label: "5 choses vues",   duration: 10, color: brand },
          { id: "toucher", label: "4 touchées",      duration: 10, color: brand },
          { id: "ouie",    label: "3 sons entendus", duration: 10, color: brand },
          { id: "odeur",   label: "2 odeurs",        duration: 10, color: brand },
          { id: "gout",    label: "1 goût",          duration: 10, color: brand },
        ]}
      />
      <CircleTimer
        title="Relaxation musculaire"
        desc="Contractez puis relâchez pour libérer le stress."
        Icon={IconMuscle}
        phases={[
          { id: "contract", label: "Contractez", duration: 5,  color: brand },
          { id: "release",  label: "Relâchez",   duration: 10, color: brand },
          { id: "contract", label: "Contractez", duration: 5,  color: brand },
          { id: "release",  label: "Relâchez",   duration: 10, color: brand },
          { id: "contract", label: "Contractez", duration: 5,  color: brand },
          { id: "release",  label: "Relâchez",   duration: 10, color: brand },
        ]}
      />
      <CircleTimer
        title="Visualisation apaisante"
        desc="Imaginez un lieu sûr pour retrouver la sérénité."
        Icon={IconVisu}
        phases={[
          { id: "close",    label: "Fermez les yeux",   duration: 15, color: brand },
          { id: "imagine",  label: "Imaginez le lieu",  duration: 15, color: brand },
          { id: "observe",  label: "Observez",          duration: 15, color: brand },
          { id: "feel",     label: "Ressentez",         duration: 15, color: brand },
        ]}
      />
    </div>
  );
}

/* ─── Modal article ─── */

const TAG_TONE: Record<string, "brand"> = {
  Dépression: "brand",      Depression: "brand",
  Anxiété: "brand",        Anxiety: "brand",
  Relations: "brand",      Relationships: "brand",
  "Estime de soi": "brand", "Self-esteem": "brand",
  Sommeil: "brand",        Sleep: "brand",
  Témoignage: "brand",     Testimony: "brand",
};

type Article = { title: string; desc: string; tag: string; content?: string };

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex w-full max-w-lg flex-col gap-5 rounded-2xl border border-line bg-surface p-7 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge tone={TAG_TONE[article.tag] ?? "brand"}>{article.tag}</Badge>
            <h2 className="mt-2 text-h2 text-ink">{article.title}</h2>
          </div>
          <button onClick={onClose} className="mt-1 rounded-full p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink">
            <X size={18} aria-hidden />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {article.content
            ? article.content.split("\n\n").map((block, i) => {
                if (block.startsWith("**")) {
                  const [ttl, ...rest] = block.split("\n");
                  return (
                    <div key={i} className="mb-4">
                      <p className="mb-1.5 font-semibold text-ink">{ttl.replace(/\*\*/g, "")}</p>
                      <p className="text-sm leading-relaxed text-ink-muted">{rest.join(" ")}</p>
                    </div>
                  );
                }
                return <p key={i} className="mb-4 text-sm leading-relaxed text-ink-muted">{block}</p>;
              })
            : <p className="text-sm leading-relaxed text-ink-muted">{article.desc}</p>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function RessourcesPage() {
  const { t } = useLang();
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  return (
    <>
      <Container size="wide" className="animate-fade-rise flex flex-col gap-10 py-10 sm:py-12">
        <PageHeader title={t.ressources.title} subtitle={t.ressources.subtitle} />
        <Exercises />
      </Container>

      <Section>
        <div className="flex flex-col gap-8">
          <CardHeader title={t.ressources.articles} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.ressources.articleList.map((article) => (
              <li key={article.title}>
                <Card className="group h-full gap-3.5 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge tone={TAG_TONE[article.tag] ?? "brand"}>{article.tag}</Badge>
                    <span className="flex items-center gap-1.5 text-tiny font-medium text-ink-subtle">
                      <BookOpen size={12} aria-hidden />5 min
                    </span>
                  </div>
                  <h3 className="text-h3 text-ink">{article.title}</h3>
                  <p className="flex-1 text-[0.8125rem] leading-relaxed text-ink-muted">{article.desc}</p>
                  <button type="button" onClick={() => setActiveArticle(article)}
                    className="mt-1 inline-flex items-center gap-1.5 self-start text-[0.8125rem] font-semibold text-brand transition-colors hover:text-brand-hover">
                    {t.ressources.readMore}
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {activeArticle && <ArticleModal article={activeArticle} onClose={() => setActiveArticle(null)} />}
    </>
  );
}
