"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  HeartHandshake,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wind,
  ClipboardList,
} from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { apiFetch } from "@/lib/api";
import { Container, Section } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, FeatureCard } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

/* ── Live stats depuis le backend ── */
type Stats = { postCount?: number; sessionCount?: number; resourceCount?: number };

function useStats() {
  const [stats, setStats] = useState<Stats>({});
  useEffect(() => {
    const load = async () => {
      try {
        const [forum, res] = await Promise.allSettled([
          apiFetch<{ total: number }>("/api/forum/posts?limit=1", { auth: false }),
          apiFetch<{ total: number }>("/api/ressources?limit=1", { auth: false }),
        ]);
        setStats({
          postCount: forum.status === "fulfilled" ? (forum.value as any).total : undefined,
          resourceCount: res.status === "fulfilled" ? (res.value as any).total : undefined,
        });
      } catch {
        // silencieux
      }
    };
    void load();
  }, []);
  return stats;
}

/* ── Compteur animé ── */
function AnimCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let current = 0;
    const step = Math.ceil(value / 40);
    const tick = () => {
      current = Math.min(current + step, value);
      setDisplay(current);
      if (current < value) ref.current = setTimeout(tick, 25);
    };
    tick();
    return () => { if (ref.current) clearTimeout(ref.current); };
  }, [value]);
  return <>{display.toLocaleString("fr-FR")}{suffix}</>;
}

/* ── Symptômes interactifs ── */
function SymptomChecklist() {
  const { t } = useLang();
  const [checked, setChecked] = useState<number[]>([]);
  const toggle = (i: number) =>
    setChecked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  return (
    <ul className="flex flex-col gap-2">
      {t.evaluation.symptoms.map((symptom: string, i: number) => {
        const on = checked.includes(i);
        return (
          <li key={symptom}>
            <button
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => toggle(i)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all duration-200",
                on
                  ? "border-brand bg-brand-softer font-semibold text-ink shadow-sm"
                  : "border-line text-ink-muted hover:border-brand-line hover:bg-brand-softer/50 hover:text-ink"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                  on ? "border-brand bg-brand text-brand-on" : "border-line-strong"
                )}
              >
                {on && <Check size={12} strokeWidth={3.5} aria-hidden />}
              </span>
              {symptom}
            </button>
          </li>
        );
      })}
      {checked.length >= 2 && (
        <li className="animate-fade-rise">
          <div className="rounded-xl border border-brand-line bg-brand-soft px-4 py-3 text-sm font-medium text-brand">
            <span className="mr-2">💚</span>
            {checked.length >= 3
              ? "Ces signaux méritent attention. Parler à quelqu'un peut vraiment aider."
              : "Vous n'êtes pas seul(e). Mythenena vous accompagne."}
          </div>
        </li>
      )}
    </ul>
  );
}

/* ── Bande de marque défilante ── */
function MarqueeBand() {
  const items = [
    "💚 Anonyme & gratuit",
    "🛡️ Données protégées",
    "🤝 Communauté bienveillante",
    "🧠 IA de soutien 24h/24",
    "📚 Ressources validées",
    "🌿 Accompagnement humain",
  ];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-line bg-surface py-3 select-none">
      <div className="flex animate-marquee whitespace-nowrap gap-12">
        {doubled.map((item, i) => (
          <span key={i} className="text-sm font-semibold text-ink-muted">{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Hero section ── */
function HeroSection({ stats }: { stats: Stats }) {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden">
      {/* Fond aurora */}
      <div className="aurora" aria-hidden />
      <div className="grid-veil absolute inset-0 -z-10" aria-hidden />

      <Container className="py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

          {/* Colonne texte */}
          <div className="animate-fade-rise">
            <Badge tone="brand" icon={<ShieldCheck size={13} aria-hidden />}>
              {t.home.eyebrow}
            </Badge>

            <h1 className="mt-6 text-display text-ink">
              {t.home.titleLead}
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-brand">{t.home.titleAccent}</span>
                <svg
                  className="absolute -bottom-1 left-0 z-0 h-3 w-full text-brand/20"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 8C40 3 78 2 118 4c28 1.5 54 3.5 80 6"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
              {t.home.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/sondage" size="lg">
                {t.home.ctaPrimary}
                <ArrowRight size={17} aria-hidden />
              </ButtonLink>
              <ButtonLink href="/chat" variant="outline" size="lg">
                <MessagesSquare size={17} aria-hidden />
                {t.home.ctaSecondary}
              </ButtonLink>
            </div>

            {/* Trust badges */}
            <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              {[t.home.trustAnonymous, t.home.trustFree, t.home.trustLanguages].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[0.8125rem] font-medium text-ink-muted">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-soft p-0.5 text-brand">
                    <Check size={11} strokeWidth={3.5} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Stats live */}
            {(stats.postCount !== undefined || stats.resourceCount !== undefined) && (
              <div className="mt-8 flex flex-wrap gap-4">
                {stats.postCount !== undefined && (
                  <div className="flex flex-col rounded-2xl border border-brand-line bg-brand-soft/60 px-4 py-3">
                    <span className="text-2xl font-extrabold text-brand tabular-nums">
                      <AnimCounter value={stats.postCount} suffix="+" />
                    </span>
                    <span className="text-[0.75rem] font-medium text-brand/80">messages partagés</span>
                  </div>
                )}
                {stats.resourceCount !== undefined && (
                  <div className="flex flex-col rounded-2xl border border-brand-line bg-brand-soft/60 px-4 py-3">
                    <span className="text-2xl font-extrabold text-brand tabular-nums">
                      <AnimCounter value={stats.resourceCount} />
                    </span>
                    <span className="text-[0.75rem] font-medium text-brand/80">ressources disponibles</span>
                  </div>
                )}
                <div className="flex flex-col rounded-2xl border border-brand-line bg-brand-soft/60 px-4 py-3">
                  <span className="text-2xl font-extrabold text-brand">24h</span>
                  <span className="text-[0.75rem] font-medium text-brand/80">disponibilité IA</span>
                </div>
              </div>
            )}
          </div>

          {/* Carte check-in */}
          <Card className="animate-fade-rise flex flex-col gap-5 p-6 shadow-lg [animation-delay:120ms] sm:p-7">
            <div className="relative overflow-hidden rounded-2xl bg-[#e6ede5] p-5">
              <img
                src="/garden.jpg"
                alt=""
                width={1000}
                height={600}
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
              <img
                src="/humaaans-scene.svg"
                alt=""
                width={275}
                height={409}
                className="relative h-52 w-full object-contain drop-shadow-sm"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand backdrop-blur-sm">
                Mythenena · {t.home.trustAnonymous}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-h3 text-ink">{t.evaluation.question}</h2>
              <Badge tone="neutral">{t.evaluation.title}</Badge>
            </div>

            <SymptomChecklist />

            <ButtonLink href="/sondage" className="w-full">
              {t.evaluation.cta}
              <ArrowRight size={16} aria-hidden />
            </ButtonLink>
          </Card>
        </div>
      </Container>
    </section>
  );
}

/* ── Piliers ── */
function PillarsSection() {
  const { t } = useLang();
  return (
    <Section>
      <div className="mb-12 flex flex-col items-center text-center">
        <Badge tone="neutral">{t.home.pillarsEyebrow}</Badge>
        <h2 className="mt-4 max-w-2xl text-h1 text-ink">{t.home.pillarsTitle}</h2>
        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
          {t.home.pillarsSubtitle}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: <ClipboardList size={20} aria-hidden />,
            title: t.evaluation.title,
            desc: t.home.pillarEvaluationDesc,
            href: "/sondage",
            cta: t.evaluation.cta,
            tone: undefined as any,
          },
          {
            icon: <HeartHandshake size={20} aria-hidden />,
            title: t.forum.title,
            desc: t.home.pillarForumDesc,
            href: "/forum",
            cta: t.forum.cta,
            tone: undefined as any,
          },
          {
            icon: <MessagesSquare size={20} aria-hidden />,
            title: t.chat.title,
            desc: t.home.pillarChatDesc,
            href: "/chat",
            cta: t.home.ctaSecondary,
            tone: "accent" as any,
          },
          {
            icon: <Stethoscope size={20} aria-hidden />,
            title: t.annuaire.pageTitle,
            desc: t.home.pillarProDesc,
            href: "/annuaire",
            cta: t.annuaire.rdv,
            tone: "neutral" as any,
          },
        ].map((pillar) => (
          <FeatureCard
            key={pillar.href}
            icon={pillar.icon}
            title={pillar.title}
            description={pillar.desc}
            tone={pillar.tone}
          >
            <ButtonLink href={pillar.href} variant="ghost" size="sm" className="-ml-4 self-start group">
              {pillar.cta}
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </ButtonLink>
          </FeatureCard>
        ))}
      </div>
    </Section>
  );
}

/* ── Comment ça marche ── */
function StepsSection() {
  const { t } = useLang();
  return (
    <Section tone="raised">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Badge tone="neutral" icon={<Sparkles size={13} aria-hidden />}>
            {t.home.stepsEyebrow}
          </Badge>
          <h2 className="mt-4 text-h1 text-ink">{t.home.stepsTitle}</h2>
          <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
            {t.home.stepsSubtitle}
          </p>
        </div>

        <ol className="flex flex-col gap-4">
          {[
            { title: t.home.step1Title, desc: t.home.step1Desc, href: "/sondage" },
            { title: t.home.step2Title, desc: t.home.step2Desc, href: "/synthese" },
            { title: t.home.step3Title, desc: t.home.step3Desc, href: "/chat" },
          ].map((step, i) => (
            <li key={step.title}>
              <Card className="group flex items-start gap-5 p-6 transition-all duration-300 hover:border-brand-line hover:shadow-md hover:-translate-y-0.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[0.9375rem] font-bold text-brand transition-colors duration-200 group-hover:bg-brand group-hover:text-brand-on">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-h3 text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
                </div>
                <ButtonLink
                  href={step.href}
                  variant="ghost"
                  size="sm"
                  aria-label={step.title}
                  className="mt-1 shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  <ArrowRight size={16} aria-hidden />
                </ButtonLink>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/* ── Page principale ── */
export default function HomePage() {
  const { t } = useLang();
  const stats = useStats();

  return (
    <>
      <HeroSection stats={stats} />
      <MarqueeBand />
      <PillarsSection />
      <StepsSection />

      {/* Urgence */}
      <Section>
        <Card className="relative overflow-hidden flex flex-col items-start gap-6 border-danger/20 bg-danger-soft p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-danger-soft to-transparent opacity-60" aria-hidden />
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger/12 text-danger animate-breathe">
              <Wind size={22} aria-hidden />
            </span>
            <div className="max-w-prose">
              <h2 className="text-h2 text-ink">{t.home.crisisTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t.home.crisisDesc}</p>
            </div>
          </div>
          <ButtonLink href="/ressources" variant="danger" className="w-full shrink-0 sm:w-auto">
            {t.home.crisisCta}
          </ButtonLink>
        </Card>
      </Section>

      {/* CTA final */}
      <Section tone="brand" className="pb-20 sm:pb-28">
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-2xl text-h1 text-ink">{t.home.ctaTitle}</h2>
          <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-ink-muted">
            {t.home.ctaSubtitle}
          </p>
          <ButtonLink href="/sondage" size="lg" className="mt-8 shadow-brand">
            {t.home.ctaButton}
            <ArrowRight size={17} aria-hidden />
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
