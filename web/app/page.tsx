"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ClipboardList,
  HeartHandshake,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wind,
} from "lucide-react";
import { useLang } from "@/lib/context/LangContext";
import { Container, Section } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, FeatureCard } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { t } = useLang();
  const [checked, setChecked] = useState<number[]>([]);

  const toggle = (i: number) =>
    setChecked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  return (
    <>
      {/* ─────────────── Hero ─────────────── */}
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden />
        <div className="grid-veil absolute inset-0 -z-10" aria-hidden />

        <Container className="py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
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
                    className="absolute -bottom-1 left-0 z-0 h-2.5 w-full text-brand/25"
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
            </div>

            {/* Check-in interactif */}
            <Card className="animate-fade-rise gap-5 p-6 shadow-lg [animation-delay:120ms] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-h3 text-ink">{t.evaluation.question}</h2>
                <Badge tone="neutral">{t.evaluation.title}</Badge>
              </div>

              <ul className="flex flex-col gap-2">
                {t.evaluation.symptoms.map((symptom, i) => {
                  const on = checked.includes(i);
                  return (
                    <li key={symptom}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => toggle(i)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all duration-200",
                          on
                            ? "border-brand bg-brand-softer font-semibold text-ink"
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
              </ul>

              <ButtonLink href="/sondage" className="w-full">
                {t.evaluation.cta}
                <ArrowRight size={16} aria-hidden />
              </ButtonLink>
            </Card>
          </div>
        </Container>
      </section>

      {/* ─────────────── Piliers ─────────────── */}
      <Section>
        <div className="mb-12 flex flex-col items-center text-center">
          <Badge tone="neutral">{t.home.pillarsEyebrow}</Badge>
          <h2 className="mt-4 max-w-2xl text-h1 text-ink">{t.home.pillarsTitle}</h2>
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
            {t.home.pillarsSubtitle}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<ClipboardList size={20} aria-hidden />}
            title={t.evaluation.title}
            description={t.home.pillarEvaluationDesc}
          >
            <ButtonLink href="/sondage" variant="ghost" size="sm" className="-ml-4 self-start">
              {t.evaluation.cta}
              <ArrowRight size={14} aria-hidden />
            </ButtonLink>
          </FeatureCard>

          <FeatureCard
            icon={<HeartHandshake size={20} aria-hidden />}
            title={t.forum.title}
            description={t.home.pillarForumDesc}
          >
            <ButtonLink href="/forum" variant="ghost" size="sm" className="-ml-4 self-start">
              {t.forum.cta}
              <ArrowRight size={14} aria-hidden />
            </ButtonLink>
          </FeatureCard>

          <FeatureCard
            icon={<MessagesSquare size={20} aria-hidden />}
            title={t.chat.title}
            description={t.home.pillarChatDesc}
            tone="accent"
          >
            <ButtonLink href="/chat" variant="ghost" size="sm" className="-ml-4 self-start">
              {t.home.ctaSecondary}
              <ArrowRight size={14} aria-hidden />
            </ButtonLink>
          </FeatureCard>

          <FeatureCard
            icon={<Stethoscope size={20} aria-hidden />}
            title={t.annuaire.pageTitle}
            description={t.home.pillarProDesc}
            tone="neutral"
          >
            <ButtonLink href="/annuaire" variant="ghost" size="sm" className="-ml-4 self-start">
              {t.annuaire.rdv}
              <ArrowRight size={14} aria-hidden />
            </ButtonLink>
          </FeatureCard>
        </div>
      </Section>

      {/* ─────────────── Comment ça marche ─────────────── */}
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
                <Card className="group flex items-start gap-5 p-6 hover:border-brand-line hover:shadow-md">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[0.9375rem] font-bold text-brand">
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
                    aria-label={`${step.title} — ${t.home.stepsEyebrow}`}
                    className="mt-1 shrink-0"
                  >
                    <ArrowRight size={16} aria-hidden />
                  </ButtonLink>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ─────────────── Bande d'urgence ─────────────── */}
      <Section>
        <Card className="flex flex-col items-start gap-6 border-danger/20 bg-danger-soft p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-danger/12 text-danger">
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

      {/* ─────────────── Appel final ─────────────── */}
      <Section tone="brand" className="pb-20 sm:pb-28">
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-2xl text-h1 text-ink">{t.home.ctaTitle}</h2>
          <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-ink-muted">
            {t.home.ctaSubtitle}
          </p>
          <ButtonLink href="/sondage" size="lg" className="mt-8">
            {t.home.ctaButton}
            <ArrowRight size={17} aria-hidden />
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
